<script setup lang="ts">
import AppHeader from '~/components/AppHeader.vue'
import { useAuthStore } from '~/stores/useAuthStore'

const user = useSupabaseUser()
const authStore = useAuthStore()

// Buscar role do usuário quando ele estiver autenticado
watch(user, async (newUser) => {
  if (newUser?.id) {
    // Só chama se de verdade tem um usuário com ID (sessão autenticada)
    try {
      await authStore.initializeProfile()
    } catch (err) {
      console.error('Erro ao inicializar perfil:', err)
    }
    
    await authStore.fetchUserRole()
  } else {
    authStore.clearAuth()
  }
}, { immediate: true })
</script>

<template>
  <div class="min-h-screen bg-secondary-50 dark:bg-dark-bg text-secondary-900 dark:text-dark-text transition-colors duration-300 flex flex-col">
    <AppHeader />
    <main class="flex-grow">
      <slot />
    </main>
  </div>
</template>
