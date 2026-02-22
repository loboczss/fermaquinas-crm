import { serverSupabaseClient } from '#supabase/server'

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

  return data
})
