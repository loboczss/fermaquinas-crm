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

  const payload = {
    ...body,
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
