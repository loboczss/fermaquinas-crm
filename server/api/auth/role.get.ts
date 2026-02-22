import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'

/**
 * Endpoint: GET /api/auth/role
 *
 * Retorna o cargo (role) do usuário autenticado a partir da tabela profiles.
 * Usado pela store useAuthStore para controle de acesso RBAC.
 *
 * Tenta primeiro com o client autenticado, e se houver erro (ex: RLS)
 * tenta com service role como fallback.
 */
export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const serviceRole = serverSupabaseServiceRole(event)

  // Obtém o usuário da sessão
  const { data: { user }, error: sessionError } = await client.auth.getUser()

  if (sessionError || !user?.id) {
    console.error('[API auth/role] Erro de sessão:', sessionError)
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Usuário não autenticado',
    })
  }

  // Tenta buscar o role com o client autenticado
  let { data: profile, error: profileError } = await client
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  // Se houver erro (pode ser RLS ou perfil não existe), tenta com service role
  if (profileError) {
    console.warn('[API auth/role] Erro com client auth, tentando service role:', profileError)
    
    const { data: serviceProfile, error: serviceError } = await serviceRole
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (serviceError) {
      console.error('[API auth/role] Erro também com service role:', serviceError)
      // Se ainda assim falhar, retorna vendedor como fallback SEGURO
      return { role: 'vendedor', userId: user.id }
    }

    profile = serviceProfile
  }

  return {
    role: profile?.role || 'vendedor',
    userId: user.id,
  }
})
