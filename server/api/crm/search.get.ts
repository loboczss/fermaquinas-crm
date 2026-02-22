import { serverSupabaseClient } from '#supabase/server'

/**
 * GET /api/crm/search
 *
 * Busca rápida de clientes por nome/telefone (usada no autocomplete de vendas).
 * Query params: q (termo), limit
 */
export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)

  const { data: { user }, error: sessionError } = await client.auth.getUser()
  if (sessionError || !user?.id) {
    throw createError({ statusCode: 401, message: 'Usuário não autenticado' })
  }

  const { q = '', limit = '10' } = getQuery(event) as Record<string, string>
  const term = q.trim()
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10))

  if (term.length < 2) {
    return []
  }

  const { data, error } = await client
    .from('crm_fermaquinas')
    .select('id, contato_id, nome, nome_social')
    .is('deleted_at', null)
    .or(`nome.ilike.%${term}%,nome_social.ilike.%${term}%,contato_id.ilike.%${term}%`)
    .limit(limitNum)

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return data || []
})
