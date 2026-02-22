import { serverSupabaseClient } from '#supabase/server'

/**
 * POST /api/crm
 *
 * Cria um novo cliente no CRM.
 * Valida duplicidade do contato_id.
 */
export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)

  const { data: { user }, error: sessionError } = await client.auth.getUser()
  if (sessionError || !user?.id) {
    throw createError({ statusCode: 401, message: 'Usuário não autenticado' })
  }

  const body = await readBody(event)

  // Defaults
  if (!body.sentimento) body.sentimento = 'Neutro'
  if (!body.urgencia) body.urgencia = 'Baixa'
  if (!body.fase_obra) body.fase_obra = 'Indefinido'

  try {
    const { data, error } = await client
      .from('crm_fermaquinas')
      .insert(body)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        throw createError({ statusCode: 409, message: 'UNIQUE_CONSTRAINT' })
      }
      throw createError({ statusCode: 500, message: error.message })
    }

    return data
  } catch (err: any) {
    if (err.statusCode) throw err
    throw createError({ statusCode: 500, message: err.message || 'Erro ao criar cliente' })
  }
})
