import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'

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
    const serviceRole = serverSupabaseServiceRole(event)

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

    // Buscar role e avatar_url do perfil na tabela profiles (tenta com client primeiro, depois service role)
    let { data: profileData, error: profileError } = await client
      .from('profiles')
      .select('role, avatar_url')
      .eq('user_id', user.id)
      .maybeSingle()

    // Se falhar com client ou não encontrar dados (RLS pode retornar 0 linhas sem erro), tenta com service role
    if (profileError || !profileData) {
      const { data: serviceProfile, error: serviceError } = await serviceRole
        .from('profiles')
        .select('role, avatar_url')
        .eq('user_id', user.id)
        .maybeSingle()

      if (serviceError) {
        console.error('[API perfil/me] Erro ao buscar role com service role:', serviceError)
        profileData = null
      } else {
        profileData = serviceProfile
      }
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
      phone_verified: false,
      role: profileData?.role || 'vendedor',
      avatar_url: profileData?.avatar_url || user.user_metadata?.avatar_url || null,
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
