<script setup lang="ts">
import PerfilForm from '~/components/perfil/PerfilForm.vue'
import AlterarSenhaForm from '~/components/perfil/AlterarSenhaForm.vue'

// SEO
useHead({
  title: 'Perfil - Minha Conta',
  meta: [
    { name: 'description', content: 'Gerencie suas informações pessoais e configurações de conta' }
  ]
})
</script>

<template>
  <div>
    <div class="border-b border-secondary-100 dark:border-dark-border/50 transition-colors duration-300 bg-white dark:bg-dark-surface">
      <div class="max-w-2xl mx-auto px-3 sm:px-4 py-3">
        <div>
          <h1 class="text-xl font-bold tracking-tight text-secondary-900 dark:text-dark-text">
            Configurações
          </h1>
          <p class="text-xs text-secondary-500 dark:text-secondary-400 mt-0.5">
            Gerencie seu perfil e preferências
          </p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-2xl mx-auto px-3 sm:px-4 py-4">
      <div class="space-y-4">
        <!-- Profile Form -->
        <div class="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <PerfilForm />
        </div>

        <!-- Divider -->
        <div class="border-t border-secondary-100 dark:border-dark-border/50"></div>

        <!-- Change Password Form -->
        <div class="animate-in fade-in slide-in-from-bottom-2 duration-300" style="animation-delay: 100ms">
          <AlterarSenhaForm />
        </div>
      </div>

      <!-- Back to Home -->
      <div class="mt-4 pt-3 border-t border-secondary-100 dark:border-dark-border/50">
        <NuxtLink 
          to="/"
          class="inline-flex items-center gap-1.5 text-xs text-secondary-600 hover:text-secondary-900 dark:text-secondary-400 dark:hover:text-secondary-200 transition-colors group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
          Voltar para o início
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
