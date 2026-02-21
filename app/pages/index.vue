<script setup lang="ts">
import BaseButton from '~/components/BaseButton.vue'
import BaseInput from '~/components/BaseInput.vue'
import { ref } from 'vue'

// Estado para testar o BaseInput
const testInput = ref('')
const testEmail = ref('')
const isLoading = ref(false)

const toggleLoading = () => {
  isLoading.value = true
  setTimeout(() => isLoading.value = false, 2000)
}
</script>

<template>
  <main class="container mx-auto px-4 py-12 space-y-16">
    <!-- Section: Base Components -->
    <section class="space-y-8">
      <div class="flex items-center gap-3 border-b border-secondary-200 dark:border-dark-border pb-4">
        <div class="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white shadow-premium">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold">Base Components (UI Kit)</h2>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <!-- Buttons Demo -->
        <div class="space-y-6">
          <h3 class="text-lg font-semibold text-secondary-600 dark:text-secondary-400">BaseButton Variants</h3>
          <div class="flex flex-wrap gap-4">
            <BaseButton variant="primary">Primary</BaseButton>
            <BaseButton variant="secondary">Secondary</BaseButton>
            <BaseButton variant="success">Success</BaseButton>
            <BaseButton variant="danger">Danger</BaseButton>
            <BaseButton variant="outline">Outline</BaseButton>
          </div>
          
          <div class="flex flex-wrap gap-4 pt-4">
            <BaseButton :loading="isLoading" @click="toggleLoading">
              Testar Loading
            </BaseButton>
            <BaseButton disabled>Desativado</BaseButton>
          </div>
        </div>

        <!-- Inputs Demo -->
        <div class="space-y-6">
          <h3 class="text-lg font-semibold text-secondary-600 dark:text-secondary-400">BaseInput Fields</h3>
          <div class="space-y-4 max-w-md">
            <BaseInput 
              v-model="testInput" 
              label="Nome do Usuário" 
              placeholder="Digite seu nome..." 
            />
            <BaseInput 
              v-model="testEmail" 
              label="E-mail" 
              type="email"
              placeholder="exemplo@email.com" 
              :error="testEmail.length > 0 && !testEmail.includes('@') ? 'E-mail inválido' : ''"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Section: Cards & Surfaces -->
    <section class="space-y-6">
      <h2 class="text-xl font-semibold border-b border-secondary-200 dark:border-dark-border pb-2">Cards Premium</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-premium border border-secondary-100 dark:border-dark-border group hover:shadow-premium-hover transition-all duration-300">
          <h3 class="font-bold text-lg mb-2 text-primary-600">Alpha</h3>
          <p class="text-secondary-600 dark:text-secondary-400">Premium shadow with hover effect.</p>
        </div>
        <div class="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-premium border border-secondary-100 dark:border-dark-border">
          <h3 class="font-bold text-lg mb-2 text-success-600">Beta</h3>
          <p class="text-secondary-600 dark:text-secondary-400">Increased radius 2xl.</p>
        </div>
        <div class="bg-white dark:bg-dark-surface p-6 rounded-3xl shadow-premium border border-secondary-100 dark:border-dark-border">
          <h3 class="font-bold text-lg mb-2 text-info-600">Gamma</h3>
          <p class="text-secondary-600 dark:text-secondary-400">Maximum radius 3xl.</p>
        </div>
      </div>
    </section>

    <!-- Section: Dark Mode Preview -->
    <section class="p-8 rounded-3xl bg-white dark:bg-dark-surface border border-secondary-200 dark:border-dark-border shadow-premium overflow-hidden relative">
      <div class="absolute top-0 right-0 p-4">
         <div class="w-3 h-3 rounded-full animate-pulse bg-primary-500 shadow-[0_0_10px_#00DC81]"></div>
      </div>
      <div class="text-center space-y-4">
        <h2 class="text-2xl font-bold">Estado do Tema Global</h2>
        <p class="text-secondary-600 dark:text-secondary-400">
          Experimente o botão de tema no cabeçalho.
        </p>
        <div class="flex justify-center gap-4 pt-4">
          <div class="px-6 py-2 rounded-xl bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-900/50 font-medium">
            Cor Primária Adaptável
          </div>
        </div>
      </div>
    </section>
  </main>

  <footer class="py-12 text-center text-secondary-500 border-t border-secondary-200 dark:border-dark-border">
    <p>&copy; 2026 ZapMulti Premium UI Kit</p>
  </footer>
</template>
