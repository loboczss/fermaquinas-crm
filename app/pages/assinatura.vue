<script setup lang="ts">
// SEO
useHead({
  title: 'Assinatura - Planos',
  meta: [
    { name: 'description', content: 'Gerencie sua assinatura e escolha o melhor plano para você' }
  ]
})
</script>

<template>
  <div>
    <div class="border-b border-secondary-100 dark:border-dark-border/50 transition-colors duration-300 bg-white dark:bg-dark-surface">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 py-5">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-secondary-900 dark:text-dark-text">
            Assinatura
          </h1>
          <p class="text-xs text-secondary-500 dark:text-secondary-400 mt-0.5">
            Gerencie seu plano e pagamentos
          </p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      <div class="bg-white dark:bg-dark-surface rounded-2xl shadow-premium border border-secondary-100 dark:border-dark-border p-8 text-center">
        <div class="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-primary-600 dark:text-primary-400" viewBox="0 0 20 20" fill="currentColor">
            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
            <path fill-rule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clip-rule="evenodd" />
          </svg>
        </div>
        <h2 class="text-xl font-bold text-secondary-900 dark:text-dark-text mb-2">
          Página em Construção
        </h2>
        <p class="text-sm text-secondary-600 dark:text-secondary-400">
          A página de assinatura estará disponível em breve.
        </p>
      </div>

      <!-- Back to Home -->
      <div class="mt-6 pt-5 border-t border-secondary-100 dark:border-dark-border/50">
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
