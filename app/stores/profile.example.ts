/**
 * Exemplo de uso do Profile Store
 * 
 * Este arquivo demonstra como usar o store do profile
 * em componentes Vue/Nuxt
 */

// ============================================
// 1) Importar o store em um componente
// ============================================

// Em um componente Vue (script setup)
import { useProfileStore } from '~/stores/profile'

const profileStore = useProfileStore()

// ============================================
// 2) Buscar dados do perfil
// ============================================

// Buscar perfil do usuário autenticado
await profileStore.fetchProfile()

// ============================================
// 3) Acessar dados do perfil
// ============================================

// Acessar o perfil completo
const profile = profileStore.profile

// Usar getters
const userName = profileStore.userName // Nome completo ou 'Usuário'
const userEmail = profileStore.userEmail // Email do usuário
const userInitials = profileStore.userInitials // Primeira letra do nome
const isLoaded = profileStore.isLoaded // Verifica se está carregado

// Verificar estado de loading e erros
const isLoading = profileStore.loading
const error = profileStore.error

// ============================================
// 4) Atualizar dados localmente
// ============================================

profileStore.updateProfileData({
  full_name: 'Novo Nome'
})

// ============================================
// 5) Recarregar perfil
// ============================================

await profileStore.refreshProfile()

// ============================================
// 6) Limpar perfil (útil no logout)
// ============================================

profileStore.clearProfile()

// ============================================
// EXEMPLO COMPLETO EM UM COMPONENTE
// ============================================

/*
<script setup lang="ts">
import { useProfileStore } from '~/stores/profile'

const profileStore = useProfileStore()

// Carregar perfil ao montar o componente
onMounted(async () => {
  await profileStore.fetchProfile()
})
</script>

<template>
  <div>
    <div v-if="profileStore.loading">Carregando...</div>
    <div v-else-if="profileStore.error">Erro: {{ profileStore.error }}</div>
    <div v-else-if="profileStore.profile">
      <h1>Olá, {{ profileStore.userName }}!</h1>
      <p>Email: {{ profileStore.userEmail }}</p>
      <p>Cadastrado em: {{ profileStore.profile.created_at }}</p>
    </div>
  </div>
</template>
*/
