<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import BaseInput from '~/components/BaseInput.vue'
import BaseButton from '~/components/BaseButton.vue'
import { useProfileStore } from '~/stores/profile'

const perfilFormId = 'perfil-form-component'
const profileStore = useProfileStore()

// Local states for form feedback
const loading = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)

const profileForm = ref({
  email: '',
  full_name: '',
  phone: '',
  created_at: ''
})

const handleUpdateProfile = async () => {
  loading.value = true
  error.value = null
  success.value = null

  const result = await profileStore.updateProfile({
    full_name: profileForm.value.full_name,
    phone: profileForm.value.phone
  })
  
  loading.value = false

  if (result.success) {
    success.value = 'Perfil atualizado com sucesso!'
    // The store automatically updates itself on success
  } else {
    error.value = result.error || 'Erro ao atualizar perfil. Tente novamente.'
  }
}

// Carregar dados do store
onMounted(() => {
  if (profileStore.profile) {
    profileForm.value.email = profileStore.profile.email || ''
    profileForm.value.full_name = profileStore.profile.full_name || ''
    profileForm.value.phone = profileStore.profile.phone || ''
    profileForm.value.created_at = profileStore.profile.created_at || ''
  }
})

// Observar mudanças no perfil do store
watch(() => profileStore.profile, (newProfile) => {
  if (newProfile) {
    profileForm.value.email = newProfile.email || ''
    profileForm.value.full_name = newProfile.full_name || ''
    profileForm.value.phone = newProfile.phone || ''
    profileForm.value.created_at = newProfile.created_at || ''
  }
}, { immediate: true, deep: true })

// Formatar data para exibição
const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}
</script>

<template>
  <div :id="perfilFormId" class="transition-colors duration-300">
    <!-- Header -->
    <div class="mb-2.5">
      <h2 class="text-base font-semibold text-secondary-900 dark:text-dark-text">
        Informações Pessoais
      </h2>
      <p class="text-xs text-secondary-500 dark:text-secondary-400 mt-0.5">
        Atualize seus dados de perfil
      </p>
    </div>

    <!-- Success Message -->
    <div 
      v-if="success" 
      class="mb-2 p-2 rounded-lg bg-success-50 dark:bg-success-900/10 border border-success-200/50 dark:border-success-900/30 text-success-700 dark:text-success-400 text-xs animate-in fade-in zoom-in duration-300"
    >
      {{ success }}
    </div>

    <!-- Error Message -->
    <div 
      v-if="error" 
      class="mb-2 p-2 rounded-lg bg-danger-50 dark:bg-danger-900/10 border border-danger-200/50 dark:border-danger-900/30 text-danger-700 dark:text-danger-400 text-xs animate-in fade-in zoom-in duration-300"
    >
      {{ error }}
    </div>

    <!-- Form -->
    <form @submit.prevent="handleUpdateProfile" class="space-y-2.5">
      <BaseInput 
        v-model="profileForm.full_name"
        label="Nome Completo"
        type="text"
        placeholder="Seu nome completo"
        :id="`${perfilFormId}-name`"
        required
      />
      
      <BaseInput 
        v-model="profileForm.email"
        label="E-mail"
        type="email"
        placeholder="seu@email.com"
        :id="`${perfilFormId}-email`"
        disabled
        required
      />

      <BaseInput 
        v-model="profileForm.phone"
        label="Telefone"
        type="tel"
        placeholder="(00) 00000-0000"
        :id="`${perfilFormId}-phone`"
      />

      <BaseInput 
        :model-value="formatDate(profileForm.created_at)"
        label="Membro desde"
        type="text"
        :id="`${perfilFormId}-created`"
        disabled
      />

      <div class="pt-0.5">
        <BaseButton 
          type="submit" 
          variant="primary" 
          class="px-4 py-1.5 text-sm"
          :loading="loading"
        >
          Salvar Alterações
        </BaseButton>
      </div>
    </form>
  </div>
</template>
