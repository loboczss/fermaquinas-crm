<script setup lang="ts">
import AppHeader from '~/components/AppHeader.vue'
import { useAuthStore } from '~/stores/useAuthStore'
import { useProfileStore } from '~/stores/profile'
import { useNotificacoesStore } from '~/stores/useNotificacoesStore'
import { onMounted, onUnmounted } from 'vue'

const route = useRoute()
const user = useSupabaseUser()
const authStore = useAuthStore()
const profileStore = useProfileStore()
const notificacoesStore = useNotificacoesStore()

let pollingInterval: NodeJS.Timeout

// Função para carregar o perfil completo
const loadUserProfile = async () => {
  if (!user.value?.id) return

  try {
    await authStore.initializeProfile()
    await profileStore.fetchProfile()
  } catch (err) {
    console.error('[Layout] Erro ao carregar perfil:', err)
  }
}

// SINCRONIZAR: Sempre que o perfil for carregado, sincronizar a role no authStore
watch(() => profileStore.profile, (profile) => {
  if (profile?.role) {
    authStore.userRole = profile.role as 'master' | 'vendedor'
    authStore.userId = profile.id || authStore.userId
    console.log('[Layout] Role sincronizada do perfil:', profile.role)
  }
}, { immediate: true, deep: true })

// Reagir quando o usuário Supabase muda (login/logout/hidratação)
watch(user, async (newUser, oldUser) => {
  if (newUser?.id) {
    if (!profileStore.profile) {
      await loadUserProfile()
    }
  } else if (oldUser?.id && !newUser?.id) {
    authStore.clearAuth()
    profileStore.clearProfile()
  }
}, { immediate: true })

// Client-side: O useSupabaseUser pode demorar a hidratar
onMounted(async () => {
  // Se o perfil já foi carregado (do SSR), sincronizar role
  if (profileStore.profile?.role && !authStore.isRoleLoaded) {
    authStore.userRole = profileStore.profile.role as 'master' | 'vendedor'
    authStore.userId = profileStore.profile.id || null
  }
  // Se não tem perfil mas tem user, carregar
  if (user.value?.id && !profileStore.profile) {
    await loadUserProfile()
  }
  // Fallback com delay para sessão Supabase que demora a restaurar
  setTimeout(async () => {
    if (user.value?.id && !profileStore.profile) {
      await loadUserProfile()
    }
  }, 500)

  // -- SISTEMA DE NOTIFICAÇÕES --
  // Ao montar, carrega notificações iniciais se autenticado
  if (user.value?.id) {
    notificacoesStore.fetchNotificacoes()
    
    // Verifica aniversários uma vez no início
    try {
      await notificacoesStore.verificarAniversarios()
    } catch (e) {
      console.warn('[Layout] Erro silencioso verificar aniversários', e)
    }

    // Iniciar polling de notificações
    pollingInterval = setInterval(() => {
      notificacoesStore.fetchNotificacoes()
    }, 60000) // 1 min
  }
})

onUnmounted(() => {
  if (pollingInterval) clearInterval(pollingInterval)
})


// Quando rota muda, garantir que perfil está carregado
watch(() => route.path, async () => {
  if (user.value?.id && !profileStore.profile) {
    try {
      await profileStore.fetchProfile()
    } catch (err) {
      console.error('[Layout] Erro ao sincronizar perfil:', err)
    }
  }
})
</script>

<template>
  <div class="min-h-screen bg-secondary-50 dark:bg-dark-bg text-secondary-900 dark:text-dark-text transition-colors duration-300 flex flex-col">
    <AppHeader />
    <main class="flex-grow">
      <slot />
    </main>
  </div>
</template>
