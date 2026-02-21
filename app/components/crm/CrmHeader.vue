<script setup lang="ts">
import { useCrmStore } from '~/stores/useCrmStore'
import { ref, watch } from 'vue'

const store = useCrmStore()
const localSearch = ref(store.searchQuery)
let timeout: any = null

const handleSearch = () => {
  if (timeout) clearTimeout(timeout)
  timeout = setTimeout(() => {
    store.searchQuery = localSearch.value
    store.currentPage = 1
    store.fetchClientes()
  }, 500)
}

watch(localSearch, () => {
  handleSearch()
})
</script>

<template>
  <div class="mb-8 sm:flex sm:items-center sm:justify-between bg-transparent">
    <div class="sm:flex-auto">
      <h1 class="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">CRM Clientes</h1>
      <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Gestão avançada de clientes, perfil, objeções e interesses.
      </p>
    </div>
    <div class="mt-4 sm:ml-16 sm:mt-0 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
      <div class="relative w-full sm:w-80">
        <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <svg class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" />
          </svg>
        </div>
        <input 
          v-model="localSearch" 
          type="text" 
          placeholder="Buscar cliente..." 
          class="block w-full rounded-xl border-0 py-2.5 pl-10 text-gray-900 dark:text-gray-100 dark:bg-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 transition-shadow"
        >
      </div>

      <button @click="store.abrirCriacao()" type="button" class="w-full sm:w-auto shrink-0 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-colors flex items-center justify-center gap-2">
        <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
        </svg>
        Novo Cliente
      </button>
    </div>
  </div>
</template>
