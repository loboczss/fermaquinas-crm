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
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md mb-4 shadow-2xl border border-white/20">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
          </svg>
        </div>
        <h1 class="text-4xl lg:text-5xl font-bold font-sans tracking-tight">
          Centralize seu atendimento com <span class="text-primary-300">ZapMulti</span>
        </h1>
        <p class="text-lg text-primary-100/80">
          Gerencie múltiplas conversas do WhatsApp em um único lugar, aumente a produtividade da sua equipe e ofereça um suporte impecável.
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
