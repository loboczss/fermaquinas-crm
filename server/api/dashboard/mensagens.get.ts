import { serverSupabaseClient } from '#supabase/server'

/**
 * GET /api/dashboard/mensagens
 *
 * Retorna todas as mensagens de um contato específico.
 * Query params: contato_id
 */
export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)

  const { data: { user }, error: sessionError } = await client.auth.getUser()
  if (sessionError || !user?.id) {
    throw createError({ statusCode: 401, message: 'Usuário não autenticado' })
  }

  const { contato_id } = getQuery(event) as { contato_id?: string }

  if (!contato_id) {
    throw createError({ statusCode: 400, message: 'contato_id é obrigatório' })
  }

  const { data, error } = await client
    .from('historico_msg_fermaquinas')
    .select('*')
    .eq('contato_id', contato_id)
    .order('created_at', { ascending: true })

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return data || []
})
