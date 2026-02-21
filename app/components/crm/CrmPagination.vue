<script setup lang="ts">
import { computed } from 'vue'
import { useCrmStore } from '~/stores/useCrmStore'

const store = useCrmStore()

const totalPages = computed(() => Math.ceil(store.totalItems / store.itemsPerPage) || 1)
const canPrev = computed(() => store.currentPage > 1)
const canNext = computed(() => store.currentPage < totalPages.value)

const displayStart = computed(() => Math.min((store.currentPage - 1) * store.itemsPerPage + 1, store.totalItems) || 0)
const displayEnd = computed(() => Math.min(store.currentPage * store.itemsPerPage, store.totalItems))
</script>

<template>
  <div class="flex items-center justify-between bg-white dark:bg-gray-900 px-4 py-3 sm:px-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 mt-4">
    <div class="flex flex-1 flex-col sm:flex-row items-center justify-between gap-4">
      <p class="text-sm text-gray-700 dark:text-gray-300">
        Mostrando <span class="font-medium">{{ displayStart }}</span> a <span class="font-medium">{{ displayEnd }}</span> de <span class="font-medium">{{ store.totalItems }}</span> clientes
      </p>
      
      <div class="flex items-center gap-4">
        <button
          @click="store.prevPage()"
          :disabled="!canPrev"
          class="relative inline-flex items-center rounded-lg px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 focus-visible:outline-offset-0 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        >
          Anterior
        </button>
        <span class="text-sm font-medium text-gray-500">
          Página {{ store.currentPage }} de {{ totalPages }}
        </span>
        <button
          @click="store.nextPage()"
          :disabled="!canNext"
          class="relative inline-flex items-center rounded-lg px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 focus-visible:outline-offset-0 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        >
          Próximo
        </button>
      </div>
    </div>
  </div>
</template>
