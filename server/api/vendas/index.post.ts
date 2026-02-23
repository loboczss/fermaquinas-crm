import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'

/**
 * POST /api/vendas
 *
 * Cria uma nova venda.
 * Automaticamente vincula o vendedor_id ao user autenticado.
 */
export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)

  const { data: { user }, error: sessionError } = await client.auth.getUser()
  if (sessionError || !user?.id) {
    throw createError({ statusCode: 401, message: 'Usuário não autenticado' })
  }

  const body = await readBody(event)

  // Extrair produtos_json para não causar erro de 'coluna inexistente' no Supabase
  const { produtos_json, ...vendaData } = body

  const payload = {
    ...vendaData,
    vendedor_id: user.id,
    vendedor: body.vendedor || user.user_metadata?.full_name || user.email || 'Vendedor Desconhecido',
  }

  const { data, error } = await client
    .from('historico_vendas_fermaquinas')
    .insert(payload)
    .select('*')
    .single()

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  // --- Início: Dedução de Estoque ---
  try {
    if (body.produtos_json && Array.isArray(body.produtos_json) && body.produtos_json.length > 0) {
      const serviceClient = serverSupabaseServiceRole(event)
      for (const item of body.produtos_json) {
        if (!item.IDPRODUTO || !item.quantidade) continue

        // 1. Buscar estoque atual do produto
        const { data: produto } = await serviceClient
          .from('produtos')
          .select('"QTDATUALESTOQUE", "IDPRODUTO", "VALPRECOVAREJO"')
          .eq('IDPRODUTO', String(item.IDPRODUTO))
          .single()

        if (produto) {
          // 2. Calcular novo estoque
          const estoqueAtual = parseInt(produto.QTDATUALESTOQUE || '0', 10)
          const novoEstoque = Math.max(0, estoqueAtual - item.quantidade) // Nunca ficar negativo

          // 3. Calcular VALTOTAL (preço × novo estoque)
          const precoStr = produto.VALPRECOVAREJO || '0'
          const preco = parseFloat(precoStr.replace(',', '.')) || 0
          const novoValTotal = preco * novoEstoque

          // 4. Atualizar estoque e VALTOTAL na tabela
          await serviceClient
            .from('produtos')
            .update({
              QTDATUALESTOQUE: String(novoEstoque),
              VALTOTAL: String(novoValTotal)
            })
            .eq('IDPRODUTO', String(item.IDPRODUTO))
        }
      }
    }
  } catch (estoqueError) {
    console.error('[API vendas/index.post] Erro ao deduzir estoque:', estoqueError)
    // Não repassa o erro para não quebrar a venda já realizada
  }
  // --- Fim: Dedução de Estoque ---

  // --- Início: Criação de Notificações ---
  try {
    const serviceClient = serverSupabaseServiceRole(event)
    const { data: masters } = await serviceClient
      .from('profiles')
      .select('user_id')
      .eq('role', 'master')

    const notificacoes = []
    const valorVenda = Number(payload.valor_venda || 0)
    const clienteNome = payload.contact_name || 'Cliente Desconhecido'
    const vendaId = data.id

    // Para cada master
    for (const master of (masters || [])) {
      notificacoes.push({
        user_id: master.user_id,
        tipo: 'venda',
        titulo: 'Nova venda registrada',
        mensagem: `Venda de R$ ${valorVenda.toFixed(2).replace('.', ',')} para ${clienteNome}`,
        referencia_id: String(vendaId),
      })
    }

    // Para o vendedor (se não for master)
    const vendedorEhMaster = masters?.some(m => m.user_id === user.id)
    if (!vendedorEhMaster) {
      notificacoes.push({
        user_id: user.id,
        tipo: 'venda',
        titulo: 'Venda registrada com sucesso',
        mensagem: `Sua venda de R$ ${valorVenda.toFixed(2).replace('.', ',')} para ${clienteNome} foi registrada`,
        referencia_id: String(vendaId),
      })
    }

    if (notificacoes.length > 0) {
      // Fire and forget, não afeta a resposta
      await client.from('notificacoes').insert(notificacoes)
    }
  } catch (notifError) {
    console.error('[API vendas/index.post] Erro ao criar notificações:', notifError)
  }
  // --- Fim: Criação de Notificações ---

  return data
})
