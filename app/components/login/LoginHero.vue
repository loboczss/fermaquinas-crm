<script setup lang="ts">
// LoginHero.vue
</script>

<template>
  <div class="relative hidden lg:flex flex-col justify-center items-center w-full min-h-screen bg-primary-900 overflow-hidden p-12">
    <!-- Background Decorators -->
    <div class="absolute inset-0 z-0">
      <div class="absolute top-0 -left-1/4 w-[150%] h-[150%] bg-gradient-to-br from-primary-500/20 via-primary-700/40 to-primary-900 rounded-full blur-3xl transform -translate-y-1/4"></div>
      <div class="absolute bottom-0 right-0 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl"></div>
    </div>

    <!-- Content -->
    <div class="relative z-10 max-w-lg text-center text-white space-y-8">
      <div class="space-y-4">

        <div class="flex justify-center mb-6">
          <img src="/logo.png" alt="Fermaquinas" class="h-24 w-auto" />
        </div>
        <h1 class="text-4xl lg:text-5xl font-bold font-sans tracking-tight">
          <span class="text-primary-300">Fermaquinas</span> Materiais para Construção
        </h1>
        <p class="text-lg text-primary-100/80">
          Sistema completo de CRM para gestão de clientes, vendas e relacionamento. Aumente a produtividade da sua equipe e ofereça um atendimento impecável.
        </p>
      </div>

      <!-- Features List -->
      <div class="grid grid-cols-2 gap-4 text-left mt-12 bg-black/20 p-6 rounded-2xl backdrop-blur-sm border border-white/10">
        <div class="flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span class="text-primary-50">Multi-atendentes</span>
        </div>
        <div class="flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span class="text-primary-50">Automações</span>
        </div>
        <div class="flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span class="text-primary-50">Relatórios</span>
        </div>
        <div class="flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span class="text-primary-50">Integrações API</span>
        </div>
      </div>
    </div>
  </div>
</template>
