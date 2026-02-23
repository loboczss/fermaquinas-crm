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

  // --- Início: Criação de Notificações (Banco de Dados) ---
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
      // Fire and forget
      await client.from('notificacoes').insert(notificacoes)
    }
  } catch (notifError) {
    console.error('[API vendas/index.post] Erro ao criar notificações no banco:', notifError)
  }
  // --- Fim: Criação de Notificações ---

  // --- Início: Envio de E-mails (Resend) ---
  // Executado de forma assíncrona (não aguarda o envio para retornar a resposta)
  try {
    const serviceClient = serverSupabaseServiceRole(event)

    // 1. Buscar emails de todos os masters
    const { data: mastersData } = await serviceClient
      .from('profiles')
      .select('user_id')
      .eq('role', 'master')

    const masterUserIds = (mastersData || []).map(m => m.user_id)

    // Para obter os emails, precisamos usar a Admin API do Supabase (service role)
    const { data: { users: allUsers } } = await serviceClient.auth.admin.listUsers()

    const masterEmails = allUsers
      .filter(u => masterUserIds.includes(u.id))
      .map(u => u.email)
      .filter((e): e is string => !!e)

    const vendedorEmail = user.email

    const valorVenda = Number(payload.valor_venda || 0)
    const clienteNome = payload.contact_name || 'Cliente Desconhecido'
    const produtosText = payload.produtos || ''

    // 2. Enviar email para o vendedor
    if (vendedorEmail) {
      sendEmail({
        to: vendedorEmail,
        subject: `✅ Venda Confirmada - ${clienteNome}`,
        html: `
          <div style="font-family: sans-serif; color: #333;">
            <h2 style="color: #10b981;">Sua venda foi registrada!</h2>
            <p>Olá <strong>${payload.vendedor}</strong>,</p>
            <p>Sua venda para o cliente <strong>${clienteNome}</strong> de <strong>R$ ${valorVenda.toFixed(2).replace('.', ',')}</strong> foi processada com sucesso.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 14px; color: #666;">Produtos: ${produtosText}</p>
          </div>
        `
      })
    }

    // 3. Enviar email para os masters (se houver algum master que não seja o próprio vendedor)
    const otherMasterEmails = masterEmails.filter(e => e !== vendedorEmail)

    if (otherMasterEmails.length > 0) {
      sendEmail({
        to: otherMasterEmails,
        subject: `💰 Nova Venda Registrada - R$ ${valorVenda.toFixed(2).replace('.', ',')}`,
        html: `
          <div style="font-family: sans-serif; color: #333;">
            <h2 style="color: #6366f1;">Alerta de Nova Venda</h2>
            <p>O vendedor <strong>${payload.vendedor}</strong> acabou de registrar uma nova venda.</p>
            <p><strong>Cliente:</strong> ${clienteNome}</p>
            <p><strong>Valor:</strong> R$ ${valorVenda.toFixed(2).replace('.', ',')}</p>
            <p><strong>Produtos:</strong> ${produtosText}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <a href="https://fermaquinas.cloud/vendas" style="display: inline-block; padding: 10px 20px; background-color: #f59e0b; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold;">Ver no Sistema</a>
          </div>
        `
      })
    }
  } catch (emailError) {
    console.error('[API vendas/index.post] Erro ao disparar e-mails:', emailError)
  }
  // --- Fim: Envio de E-mails ---

  return data
})
