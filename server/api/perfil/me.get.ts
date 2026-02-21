import { serverSupabaseClient } from '#supabase/server'

/**
 * Endpoint: GET /api/perfil/me
 * 
 * Retorna os dados do perfil do usuário autenticado
 * Usa a chave de serviço do Supabase (SUPABASE_SECRET_KEY) para ter privilégios administrativos
 * 
 * @returns UserProfile - Dados do perfil do usuário
 * 
 * Exemplo de uso no client:
 * ```ts
 * const { data, error } = await useFetch('/api/perfil/me')
 * ```
 */
export default defineEventHandler(async (event) => {
  try {
    // Usar o client do Supabase para obter o usuário da sessão
    const client = await serverSupabaseClient(event)
    
    // Obter o usuário da sessão atual
    const { data: { user }, error: sessionError } = await client.auth.getUser()
    
    if (sessionError || !user || !user.id) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
        message: 'Usuário não autenticado'
      })
    }

    // Validar se o ID é um UUID válido
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(user.id)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'ID do usuário inválido'
      })
    }

    // Retornar dados do perfil
    return {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || null,
      created_at: user.created_at,
      updated_at: user.updated_at,
      email_verified: user.user_metadata?.email_verified || false,
      phone: user.user_metadata?.phone || null,
      phone_verified: false
    }
  } catch (error: any) {
    // Se já for um erro HTTP, re-lança
    if (error.statusCode) {
      throw error
    }

    // Caso contrário, cria um novo erro genérico
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: error.message || 'Erro ao buscar perfil do usuário'
    })
  }
})
