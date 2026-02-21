<script setup lang="ts">
import { ref } from 'vue'
import BaseInput from '~/components/BaseInput.vue'
import BaseButton from '~/components/BaseButton.vue'
import { useProfile } from '~/composables/useProfile'

const alterarSenhaFormId = 'alterar-senha-form-component'
const { changePassword, loading, error, success } = useProfile()

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validationError = ref<string | null>(null)

const handleChangePassword = async () => {
  validationError.value = null

  // Validate password match
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    validationError.value = 'As senhas não coincidem'
    return
  }

  // Validate password length
  if (passwordForm.value.newPassword.length < 6) {
    validationError.value = 'A nova senha deve ter pelo menos 6 caracteres'
    return
  }

  // Validate different passwords
  if (passwordForm.value.currentPassword === passwordForm.value.newPassword) {
    validationError.value = 'A nova senha deve ser diferente da senha atual'
    return
  }

  const { error: changeError } = await changePassword(
    passwordForm.value.currentPassword,
    passwordForm.value.newPassword
  )
  
  if (!changeError) {
    console.log('Senha alterada com sucesso!')
    // Clear form
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  }
}
</script>

<template>
  <div :id="alterarSenhaFormId" class="transition-colors duration-300">
    <!-- Header -->
    <div class="mb-2.5">
      <h2 class="text-base font-semibold text-secondary-900 dark:text-dark-text">
        Segurança
      </h2>
      <p class="text-xs text-secondary-500 dark:text-secondary-400 mt-0.5">
        Atualize sua senha para manter sua conta segura
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
      v-if="error || validationError" 
      class="mb-2 p-2 rounded-lg bg-danger-50 dark:bg-danger-900/10 border border-danger-200/50 dark:border-danger-900/30 text-danger-700 dark:text-danger-400 text-xs animate-in fade-in zoom-in duration-300"
    >
      {{ error || validationError }}
    </div>

    <!-- Form -->
    <form @submit.prevent="handleChangePassword" class="space-y-2.5">
      <BaseInput 
        v-model="passwordForm.currentPassword"
        label="Senha Atual"
        type="password"
        placeholder="••••••••"
        :id="`${alterarSenhaFormId}-current`"
        required
      />
      
      <BaseInput 
        v-model="passwordForm.newPassword"
        label="Nova Senha"
        type="password"
        placeholder="••••••••"
        :id="`${alterarSenhaFormId}-new`"
        required
      />

      <BaseInput 
        v-model="passwordForm.confirmPassword"
        label="Confirmar Nova Senha"
        type="password"
        placeholder="••••••••"
        :id="`${alterarSenhaFormId}-confirm`"
        required
      />

      <div class="pt-0.5">
        <BaseButton 
          type="submit" 
          variant="primary" 
          class="px-4 py-1.5 text-sm"
          :loading="loading"
        >
          Atualizar Senha
        </BaseButton>
      </div>
    </form>
  </div>
</template>
