import { serverSupabaseClient } from '#supabase/server'

/**
 * PUT /api/crm/:id
 *
 * Atualiza um cliente existente no CRM.
 * O campo contato_id é protegido contra alteração.
 */
export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)

  const { data: { user }, error: sessionError } = await client.auth.getUser()
  if (sessionError || !user?.id) {
    throw createError({ statusCode: 401, message: 'Usuário não autenticado' })
  }

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'ID do cliente é obrigatório' })
  }

  const body = await readBody(event)

  // Segurança: contato_id NUNCA deve ser atualizado
  delete body.contato_id
  delete body.id
  delete body.created_at
  delete body.deleted_at
  delete body.deleted_by

  const { data, error } = await client
    .from('crm_fermaquinas')
    .update(body)
    .eq('id', parseInt(id, 10))
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return data
})
