<script setup lang="ts">
import { ref } from 'vue'
import BaseInput from '~/components/BaseInput.vue'
import BaseButton from '~/components/BaseButton.vue'
import ThemeToggle from '~/components/ThemeToggle.vue'
import { useAuth } from '~/composables/useAuth'

const activeTab = ref<'login' | 'register'>('login')
// Force HMR refresh
const { login, register, loading: authLoading, error: authError } = useAuth()

// Form States
const loginForm = ref({
  email: '',
  password: ''
})

const registerForm = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const registrationSuccess = ref(false)
const loginSuccess = ref(false)

const handleLogin = async () => {
  loginSuccess.value = false
  const { error } = await login(loginForm.value.email, loginForm.value.password)
  if (!error) {
    loginSuccess.value = true
    console.log('Login realizado com sucesso!')
    setTimeout(() => {
      navigateTo('/')
    }, 1500)
  }
}

const handleRegister = async () => {
  registrationSuccess.value = false
  const { data, error } = await register(registerForm.value.email, registerForm.value.password, {
    data: {
      full_name: registerForm.value.name
    }
  })
  
  if (!error) {
    registrationSuccess.value = true
    console.log('Cadastro realizado com sucesso!', data)
  }
}
</script>

<template>
  <div class="flex flex-col justify-center min-h-screen p-8 sm:p-12 lg:p-24 bg-white dark:bg-dark-bg transition-colors duration-300">
    <div class="w-full max-w-md mx-auto relative h-full flex flex-col justify-center">
      <!-- Dark Mode Toggle -->
      <div class="absolute top-0 right-0">
        <ThemeToggle />
      </div>

      <!-- Logo e Header -->
      <div class="mb-10 mt-12 lg:mt-0 text-center">
        <div class="flex justify-center mb-6">
          <img src="/logo.png" alt="Fermaquinas" class="h-20 w-auto" />
        </div>
        <h2 class="text-3xl font-bold text-secondary-900 dark:text-dark-text mb-2 transition-colors duration-300">
          Fermaquinas Materiais para Construção
        </h2>
        <p class="text-secondary-500 dark:text-secondary-400 transition-colors duration-300">
          CRM - Sistema de Gestão de Relacionamento
        </p>
      </div>

      <!-- Tabs -->
      <div class="flex bg-secondary-100 dark:bg-dark-surface p-1 rounded-xl mb-8 transition-colors duration-300">
        <button 
          @click="activeTab = 'login'; authError = null; registrationSuccess = false; loginSuccess = false"
          :class="[
            'flex-1 py-2.5 text-sm font-medium rounded-lg transition-all',
            activeTab === 'login' 
              ? 'bg-white dark:bg-dark-bg text-primary-600 shadow-sm' 
              : 'text-secondary-500 dark:text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-200'
          ]"
        >
          Entrar
        </button>
        <button 
          @click="activeTab = 'register'; authError = null; registrationSuccess = false; loginSuccess = false"
          :class="[
            'flex-1 py-2.5 text-sm font-medium rounded-lg transition-all',
            activeTab === 'register' 
              ? 'bg-white dark:bg-dark-bg text-primary-600 shadow-sm' 
              : 'text-secondary-500 dark:text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-200'
          ]"
        >
          Cadastrar
        </button>
      </div>

      <!-- Messages -->
      <div v-if="authError" class="mb-6 p-3 rounded-lg bg-danger-50 dark:bg-danger-900/10 border border-danger-200 dark:border-danger-900/30 text-danger-600 dark:text-danger-400 text-sm animate-in fade-in zoom-in duration-300">
        {{ authError }}
      </div>

      <div v-if="registrationSuccess" class="mb-6 p-3 rounded-lg bg-success-50 dark:bg-success-900/10 border border-success-200 dark:border-success-900/30 text-success-600 dark:text-success-400 text-sm animate-in fade-in zoom-in duration-300">
        Cadastro realizado! Verifique seu e-mail para confirmar a conta.
      </div>

      <div v-if="loginSuccess" class="mb-6 p-3 rounded-lg bg-success-50 dark:bg-success-900/10 border border-success-200 dark:border-success-900/30 text-success-600 dark:text-success-400 text-sm animate-in fade-in zoom-in duration-300">
        Login realizado com sucesso! Redirecionando...
      </div>

      <!-- Login Form -->
      <form v-if="activeTab === 'login'" @submit.prevent="handleLogin" class="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <BaseInput 
          v-model="loginForm.email"
          label="E-mail"
          type="email"
          placeholder="seu@email.com"
          required
        />
        
        <div class="space-y-1">
          <BaseInput 
            v-model="loginForm.password"
            label="Senha"
            type="password"
            placeholder="••••••••"
            required
          />
          <div class="flex justify-end">
            <a href="#" class="text-xs text-primary-600 hover:text-primary-500 transition-colors">
              Esqueceu a senha?
            </a>
          </div>
        </div>

        <BaseButton 
          type="submit" 
          variant="primary" 
          class="w-full mt-4"
          :loading="authLoading"
        >
          Acessar Plataforma
        </BaseButton>
      </form>

      <!-- Register Form -->
      <form v-else @submit.prevent="handleRegister" class="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <BaseInput 
          v-model="registerForm.name"
          label="Nome Completo"
          placeholder="João da Silva"
          required
        />
        
        <BaseInput 
          v-model="registerForm.email"
          label="E-mail Corporativo"
          type="email"
          placeholder="joao@empresa.com"
          required
        />
        
        <BaseInput 
          v-model="registerForm.password"
          label="Senha"
          type="password"
          placeholder="Mínimo 8 caracteres"
          required
        />
        
        <BaseInput 
          v-model="registerForm.confirmPassword"
          label="Confirmar Senha"
          type="password"
          placeholder="Repita sua senha"
          :error="registerForm.confirmPassword && registerForm.password !== registerForm.confirmPassword ? 'As senhas não coincidem' : ''"
          required
        />

        <div class="flex items-center mt-2 mb-4">
          <input id="terms" type="checkbox" required class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
          <label for="terms" class="ml-2 text-xs text-secondary-500 dark:text-secondary-400">
            Eu concordo com a <a href="#" class="text-primary-600 hover:underline">Política de Privacidade</a>.
          </label>
        </div>

        <BaseButton 
          type="submit" 
          variant="primary" 
          class="w-full"
          :loading="authLoading"
          :disabled="registerForm.password !== registerForm.confirmPassword"
        >
          Criar Minha Conta
        </BaseButton>
      </form>

    </div>
  </div>
</template>
