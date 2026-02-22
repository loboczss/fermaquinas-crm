import { serverSupabaseClient } from '#supabase/server'

/**
 * GET /api/crm/:id/related
 *
 * Retorna mensagens e vendas de um cliente especifico (por contato_id).
 * Query param: contato_id
 */
export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)

  const { data: { user }, error: sessionError } = await client.auth.getUser()
  if (sessionError || !user?.id) {
    throw createError({ statusCode: 401, message: 'Usuario nao autenticado' })
  }

  const id = getRouterParam(event, 'id')
  const { contato_id } = getQuery(event) as { contato_id?: string }

  if (!contato_id) {
    throw createError({ statusCode: 400, message: 'contato_id e obrigatorio' })
  }

  // Busca mensagens e vendas em paralelo
  const [mensagensResult, vendasResult] = await Promise.all([
    client
      .from('historico_msg_fermaquinas')
      .select('*')
      .eq('contato_id', contato_id)
      .order('created_at', { ascending: false })
      .limit(20),
    client
      .from('historico_vendas_fermaquinas')
      .select('*')
      .eq('contato_id', contato_id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false }),
  ])

  return {
    mensagens: mensagensResult.data || [],
    vendas: vendasResult.data || [],
  }
})
