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
  try {
    const client = await serverSupabaseClient(event)
    const serviceRole = serverSupabaseServiceRole(event)

    // Obtém o usuário da sessão
    const { data: { user }, error: sessionError } = await client.auth.getUser()

    // Se não há sessão, retorna vendedor como padrão (sem erro 401)
    if (sessionError || !user?.id) {
      console.warn('[API auth/role] Sem sessão de autenticação, retornando role padrão')
      return { role: 'vendedor', userId: null }
    }

    console.log('[API auth/role] Consultando role para user_id:', user.id)

    // Tenta buscar o role com o client autenticado
    let { data: profile, error: profileError } = await client
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle()

    // Se houver erro ou perfil não encontrado (RLS pode omitir a linha sem erro), tenta com service role
    if (profileError || !profile) {
      console.warn('[API auth/role] Erro ou perfil omitido (RLS?) com client auth, tentando service role')

      const { data: serviceProfile, error: serviceError } = await serviceRole
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle()

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
  } catch (error: any) {
    console.error('[API auth/role] Erro não tratado:', error)
    return { role: 'vendedor', userId: null }
  }
})
