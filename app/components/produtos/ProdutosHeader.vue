<script setup lang="ts">
import { ref, watch } from 'vue'
import { useProdutosStore } from '~/stores/useProdutosStore'
import ProdutosUpload from './ProdutosUpload.vue'

const store = useProdutosStore()
const localSearch = ref('')

// Debounce customizado de 400ms para a busca
let timeoutId: ReturnType<typeof setTimeout> | null = null

const handleSearch = (query: string) => {
  if (timeoutId) clearTimeout(timeoutId)
  timeoutId = setTimeout(() => {
    store.searchProdutos(query, 1) // Reseta para a página 1 em nova busca
  }, 400)
}

watch(localSearch, (newVal) => {
  handleSearch(newVal)
})
</script>

<template>
  <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between shrink-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
    <div>
      <h1 class="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
        <svg class="w-8 h-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        Produtos
      </h1>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
        Catálogo de produtos disponíveis (Total: {{ store.total.toLocaleString('pt-BR') }} itens)
      </p>
    </div>
    
    <div class="mt-4 sm:mt-0 relative w-full sm:w-80 flex flex-col gap-3 items-end">
      <!-- Botão de Upload Renderizado aqui (aparece apenas pra master dentro do component) -->
      <ProdutosUpload @updated="store.fetchProdutos()" />

      <div class="relative w-full">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" />
          </svg>
        </div>
        <input 
          v-model="localSearch"
          type="text" 
          placeholder="Buscar por descrição ou modelo..." 
          class="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-xl leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:text-white sm:text-sm transition-colors"
        />
      </div>
    </div>
  </div>
</template>
