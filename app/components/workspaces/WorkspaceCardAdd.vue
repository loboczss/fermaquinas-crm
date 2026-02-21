<script setup lang="ts">
const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <button
    type="button"
    class="group w-full h-full min-h-[220px] flex flex-col items-center justify-center gap-4 p-6 rounded-2xl border-2 border-dashed border-secondary-200 dark:border-secondary-800 bg-transparent hover:bg-white dark:hover:bg-dark-surface hover:border-primary-500/50 dark:hover:border-primary-500/40 hover:shadow-premium transition-all duration-300 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-dark-bg"
    @click="emit('click')"
  >
    <div class="w-12 h-12 rounded-full bg-secondary-50 dark:bg-secondary-900/50 border border-secondary-200 dark:border-secondary-800 flex items-center justify-center group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 group-hover:border-primary-200 dark:group-hover:border-primary-900/50 transition-all duration-300 group-hover:scale-110">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        class="h-6 w-6 text-secondary-400 dark:text-secondary-500 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      >
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    </div>
    <span class="text-sm font-semibold text-secondary-600 dark:text-secondary-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
      Criar novo workspace
    </span>
  </button>
</template>
