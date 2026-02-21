/**
 * Plugin para carregar dados do perfil do usuário automaticamente
 * 
 * Este plugin é executado apenas no client-side e:
 * - Busca os dados do perfil quando o usuário está autenticado
 * - Monitora mudanças no estado de autenticação (login/logout)
 * - Limpa os dados do perfil quando o usuário faz logout
 */
export default defineNuxtPlugin(() => {
  const supabase = useSupabaseClient()
  const profileStore = useProfileStore()

  // Verificar o usuário atual imediatamente
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user?.id) {
      profileStore.fetchProfile()
    }
  })

  // Monitora mudanças no estado de autenticação usando o evento do Supabase
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session?.user?.id) {
      // Aguarda um momento para garantir que os cookies sejam estabelecidos
      await new Promise(resolve => setTimeout(resolve, 500))
      profileStore.fetchProfile()
    } else if (event === 'SIGNED_OUT') {
      profileStore.clearProfile()
    } else if (event === 'TOKEN_REFRESHED' && session?.user?.id) {
      if (!profileStore.isLoaded) {
        profileStore.fetchProfile()
      }
    }
  })
})
