import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'

/**
 * Endpoint: POST /api/perfil/initialize
 *
 * Inicializa o perfil do usuário se não existir.
 * Cria um novo registro na tabela profiles com role 'vendedor' como padrão.
 *
 * Usado na primeira vez que usuário faz login para garantir que tem um perfil.
 */
export default defineEventHandler(async (event) => {
  try {
    const client = await serverSupabaseClient(event)
    const serviceRole = serverSupabaseServiceRole(event)

    // Obtém o usuário da sessão
    const { data: { user }, error: sessionError } = await client.auth.getUser()

    if (sessionError || !user?.id) {
      console.warn('[API perfil/initialize] Sem sessão de autenticação')
      return { success: false, message: 'Não autenticado' }
    }

    // Verifica se o perfil já existe
    const { data: existingProfile, error: checkError } = await serviceRole
      .from('profiles')
      .select('id, role')
      .eq('user_id', user.id)
      .maybeSingle()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('[API perfil/initialize] Erro ao verificar perfil:', checkError)
      return { success: false, message: 'Erro ao verificar perfil' }
    }

    // Se perfil já existe, retorna os dados existentes
    if (existingProfile) {
      console.log('[API perfil/initialize] Perfil já existe para usuário:', user.id)
      return {
        success: true,
        message: 'Perfil já existe',
        profile: existingProfile,
        created: false
      }
    }

    // Cria novo perfil com role padrão 'vendedor'
    const { data: newProfile, error: createError } = await serviceRole
      .from('profiles')
      .insert({
        user_id: user.id,
        role: 'vendedor',
        created_at: new Date().toISOString(),
      })
      .select('id, role, user_id')
      .maybeSingle()

    if (createError) {
      console.error('[API perfil/initialize] Erro ao criar perfil:', createError)
      return { success: false, message: 'Erro ao criar perfil', error: createError }
    }

    console.log('[API perfil/initialize] Perfil criado para usuário:', user.id)
    return {
      success: true,
      message: 'Perfil criado com sucesso',
      profile: newProfile,
      created: true
    }
  } catch (error: any) {
    console.error('[API perfil/initialize] Erro não tratado:', error)
    return { success: false, message: 'Erro interno', error: error.message }
  }
})
