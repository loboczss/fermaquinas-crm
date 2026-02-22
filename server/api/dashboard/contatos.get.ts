import { serverSupabaseClient } from '#supabase/server'

/**
 * GET /api/dashboard/contatos
 *
 * Retorna contatos únicos com última mensagem no período.
 * Query params: data_inicio, data_fim
 */
export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)

  const { data: { user }, error: sessionError } = await client.auth.getUser()
  if (sessionError || !user?.id) {
    throw createError({ statusCode: 401, message: 'Usuário não autenticado' })
  }

  const { data_inicio, data_fim } = getQuery(event) as { data_inicio?: string; data_fim?: string }

  if (!data_inicio || !data_fim) {
    throw createError({ statusCode: 400, message: 'data_inicio e data_fim são obrigatórios' })
  }

  const { data, error } = await client
    .from('historico_msg_fermaquinas')
    .select('contato_id, contact_name, mensagem, created_at')
    .gte('created_at', `${data_inicio}T00:00:00`)
    .lte('created_at', `${data_fim}T23:59:59`)
    .order('created_at', { ascending: false })

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  // Agrupa por contato_id e pega a última mensagem
  const map = new Map<string, { contato_id: string; contact_name: string | null; ultima_mensagem: string | null; ultima_data: string }>()
  for (const row of data ?? []) {
    if (!map.has(row.contato_id)) {
      map.set(row.contato_id, {
        contato_id: row.contato_id,
        contact_name: row.contact_name,
        ultima_mensagem: row.mensagem,
        ultima_data: row.created_at,
      })
    }
  }

  return Array.from(map.values())
})
