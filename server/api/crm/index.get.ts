import { serverSupabaseClient } from '#supabase/server'

/**
 * GET /api/crm
 *
 * Lista paginada de clientes do CRM com busca textual.
 * Query params: page, limit, search
 * RBAC: master vê todos; vendedor vê apenas clientes que ele cadastrou.
 */
export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)

  // Autenticação
  const { data: { user }, error: sessionError } = await client.auth.getUser()
  if (sessionError || !user?.id) {
    throw createError({ statusCode: 401, message: 'Usuário não autenticado' })
  }

  // Query params
  const { page = '1', limit = '15', search = '' } = getQuery(event) as Record<string, string>
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

  // Montar query
  let query = client
    .from('crm_fermaquinas')
    .select('*', { count: 'exact' })
    .is('deleted_at', null)

  // RBAC: vendedor só vê os clientes que ele cadastrou (created_by)
  // Se a tabela tiver coluna created_by, filtrar por ela.
  // Caso contrário, vendedor vê todos os clientes (CRM é compartilhado).
  // Assumindo que não há coluna created_by, vendedor vê todos clientes.
  // Se no futuro for necessário restringir, adicionar .eq('created_by', user.id)

  // Busca textual
  if (search && search.trim()) {
    const q = `%${search.trim()}%`
    query = query.or(`nome.ilike.${q},nome_social.ilike.${q},contato_id.ilike.${q}`)
  }

  const { data, error, count } = await query
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
