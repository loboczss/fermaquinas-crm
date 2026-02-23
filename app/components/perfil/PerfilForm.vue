<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import BaseInput from '~/components/BaseInput.vue'
import BaseButton from '~/components/BaseButton.vue'
import { useProfileStore } from '~/stores/profile'

const perfilFormId = 'perfil-form-component'
const profileStore = useProfileStore()
const avatarUrl = computed(() => profileStore.profile?.avatar_url)

// Local states for form feedback
const loading = ref(false)
const uploadingAvatar = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)

// Ref para o input file
const fileInputRef = ref<HTMLInputElement | null>(null)

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

// Função para abrir o seletor de arquivo
const triggerFileInput = () => {
  fileInputRef.value?.click()
}

// Função para lidar com o upload do avatar
const handleAvatarUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return

  // Validar tipo de arquivo
  if (!file.type.startsWith('image/')) {
    error.value = 'Por favor, selecione uma imagem válida'
    return
  }

  // Validar tamanho (máximo 5MB)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    error.value = 'A imagem deve ter no máximo 5MB'
    return
  }

  uploadingAvatar.value = true
  error.value = null
  success.value = null

  try {
    // Criar FormData e enviar para API do Dropbox
    const formData = new FormData()
    formData.append('file', file)

    const uploadResponse = await $fetch<{ success: boolean, foto_url: string }>('/api/dropbox/upload', {
      method: 'POST',
      body: formData
    })

    if (uploadResponse.success && uploadResponse.foto_url) {
      // Atualizar o avatar_url no perfil via API
      console.log('[PerfilForm] Enviando atualização de avatar com URL:', uploadResponse.foto_url)
      
      const result = await profileStore.updateProfile({
        avatar_url: uploadResponse.foto_url
      })

      console.log('[PerfilForm] Resultado do updateProfile:', result)

      if (result.success) {
        success.value = 'Foto de perfil atualizada com sucesso!'
        // computed avatarUrl e a store reagirão automaticamente
      } else {
        error.value = result.error || 'Erro ao atualizar foto de perfil'
      }
    }
  } catch (err: any) {
    console.error('[PerfilForm] Erro no upload do avatar:', err)
    error.value = err.data?.message || err.message || 'Erro ao fazer upload da imagem'
  } finally {
    uploadingAvatar.value = false
    // Limpar o input para permitir upload da mesma imagem novamente
    if (target) target.value = ''
  }
}

// Computed para obter as iniciais do usuário
const userInitials = computed(() => {
  const name = profileStore.profile?.full_name || 'U'
  return name
    .split(' ')
    .map(n => n.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase()
})

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
    <!-- Avatar Section -->
    <div class="mb-6 flex flex-col items-center">
      <div class="relative group">
        <!-- Avatar Circle -->
        <button
          type="button"
          @click="triggerFileInput"
          :disabled="uploadingAvatar"
          class="relative w-24 h-24 rounded-full overflow-hidden ring-4 ring-primary-500/20 dark:ring-primary-500/30 hover:ring-primary-500/40 dark:hover:ring-primary-500/50 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary-500/50 disabled:opacity-60 disabled:cursor-not-allowed"
          :class="{ 'cursor-pointer': !uploadingAvatar, 'cursor-wait': uploadingAvatar }"
        >
          <!-- Image if avatar_url exists -->
          <img
            v-if="avatarUrl"
            :src="avatarUrl"
            :alt="profileStore.profile?.full_name || 'Avatar'"
            class="w-full h-full object-cover"
          />
          
          <!-- Initials if no avatar -->
          <div
            v-else
            class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-400 to-primary-600 dark:from-primary-500 dark:to-primary-700 text-white text-2xl font-bold"
          >
            {{ userInitials }}
          </div>

          <!-- Loading Overlay -->
          <div
            v-if="uploadingAvatar"
            class="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm"
          >
            <svg class="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>

          <!-- Hover Overlay -->
          <div
            v-if="!uploadingAvatar"
            class="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100"
          >
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </button>

        <!-- Camera Icon Badge -->
        <div
          v-if="!uploadingAvatar"
          class="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary-500 dark:bg-primary-600 flex items-center justify-center ring-4 ring-white dark:ring-dark-bg shadow-lg group-hover:scale-110 transition-transform duration-300"
        >
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </div>
      </div>

      <!-- Helper Text -->
      <p class="mt-3 text-xs text-secondary-500 dark:text-secondary-400 text-center">
        Clique na foto para alterar<br>
        <span class="text-[10px] opacity-75">JPG, PNG, GIF ou WEBP (máx. 5MB)</span>
      </p>

      <!-- Hidden File Input -->
      <input
        ref="fileInputRef"
        type="file"
        accept="image/*"
        class="hidden"
        @change="handleAvatarUpload"
      />
    </div>

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
