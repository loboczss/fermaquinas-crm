import { serverSupabaseClient } from '#supabase/server'

/**
 * DELETE /api/crm/:id
 *
 * Soft delete de um cliente no CRM (seta deleted_at e deleted_by).
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

  const { error } = await client
    .from('crm_fermaquinas')
    .update({
      deleted_at: new Date().toISOString(),
      deleted_by: user.id,
    })
    .eq('id', parseInt(id, 10))

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return { success: true }
})
