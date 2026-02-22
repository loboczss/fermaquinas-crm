import { serverSupabaseClient } from '#supabase/server'

/**
 * GET /api/vendas
 *
 * Lista paginada de vendas com RBAC.
 * Query params: page, limit
 * Master vê todas as vendas; vendedor vê apenas suas próprias.
 */
export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)

  const { data: { user }, error: sessionError } = await client.auth.getUser()
  if (sessionError || !user?.id) {
    throw createError({ statusCode: 401, message: 'Usuário não autenticado' })
  }

  const { page = '1', limit = '15' } = getQuery(event) as Record<string, string>
  const pageNum = Math.max(1, parseInt(page, 10) || 1)
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 15))
  const from = (pageNum - 1) * limitNum
  const to = from + limitNum - 1

  // Buscar role do usuário
  const { data: profile } = await client
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isMaster = profile?.role === 'master'

  let query = client
    .from('historico_vendas_fermaquinas')
    .select('*', { count: 'exact' })
    .is('deleted_at', null)

  // RBAC: vendedor só vê suas próprias vendas
  if (!isMaster) {
    query = query.eq('vendedor_id', user.id)
  }

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return {
    data: data || [],
    total: count ?? 0,
    page: pageNum,
  }
})
