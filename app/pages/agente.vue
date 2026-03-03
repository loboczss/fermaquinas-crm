<script setup lang="ts">
import { ref } from 'vue'

const activeTab = ref<'rag' | 'prompt'>('rag')
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 py-12 animate-fade-in relative">
    <!-- Background Accents -->
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary-500/10 dark:bg-primary-500/5 blur-[100px] rounded-full pointer-events-none -z-10"></div>
    
    <!-- Header -->
    <div class="mb-10 text-center">
      <h1 class="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-900 dark:from-primary-400 dark:to-primary-600 mb-4 tracking-tight">
        Configuração do Assistente
      </h1>
      <p class="text-secondary-600 dark:text-secondary-400 text-lg max-w-2xl mx-auto">
        Personalize a base de conhecimento e as diretrizes de comportamento do seu agente AI.
      </p>
    </div>

    <!-- Segmented Tabs -->
    <div class="flex justify-center mb-10">
      <div class="bg-secondary-100/50 dark:bg-dark-surface/50 backdrop-blur-md p-1.5 rounded-2xl flex gap-2 border border-white/20 dark:border-dark-border/50 shadow-sm relative z-10 w-full max-w-md">
        <button 
          @click="activeTab = 'rag'"
          :class="[
            'flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ease-out flex justify-center items-center gap-2',
            activeTab === 'rag' 
              ? 'bg-white dark:bg-secondary-800 text-primary-600 dark:text-primary-400 shadow-sm ring-1 ring-secondary-200/50 dark:ring-dark-border' 
              : 'text-secondary-500 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-200 hover:bg-white/50 dark:hover:bg-dark-surface/80'
          ]"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          Base de Conhecimento
        </button>
        <button 
          @click="activeTab = 'prompt'"
          :class="[
            'flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ease-out flex justify-center items-center gap-2',
            activeTab === 'prompt' 
              ? 'bg-white dark:bg-secondary-800 text-primary-600 dark:text-primary-400 shadow-sm ring-1 ring-secondary-200/50 dark:ring-dark-border' 
              : 'text-secondary-500 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-200 hover:bg-white/50 dark:hover:bg-dark-surface/80'
          ]"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
          System Prompt
        </button>
      </div>
    </div>

    <!-- Tab Content Container -->
    <div class="relative z-10">
      <div class="bg-white/70 dark:bg-dark-surface/70 backdrop-blur-xl border border-white/40 dark:border-dark-border/60 rounded-3xl p-6 sm:p-8 md:p-10 shadow-xl shadow-secondary-200/20 dark:shadow-black/40 ring-1 ring-secondary-100 dark:ring-dark-border/50">
        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="transform opacity-0 translate-y-4"
          enter-to-class="transform opacity-100 translate-y-0"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="transform opacity-100"
          leave-to-class="transform opacity-0 -translate-y-4"
          mode="out-in"
        >
          <div :key="activeTab">
            <AgenteRagTab v-if="activeTab === 'rag'" />
            <AgenteSystemPromptTab v-else />
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>
