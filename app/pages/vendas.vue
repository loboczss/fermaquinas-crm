<script setup lang="ts">
import { onMounted } from 'vue'
import { useVendasStore } from '~/stores/useVendasStore'
import VendasTable from '~/components/vendas/VendasTable.vue'
import VendasCreateModal from '~/components/vendas/VendasCreateModal.vue'

const store = useVendasStore()

onMounted(() => {
  store.fetchVendas()
})
</script>

<template>
  <main class="min-h-[calc(100vh-3.5rem)] bg-gray-50/50 dark:bg-gray-900 transition-colors p-4 sm:p-6 lg:p-8">
    <div class="max-w-7xl mx-auto flex flex-col h-full">
      <!-- Title Area -->
      <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between shrink-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div>
          <h1 class="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">
            Vendas Relizadas
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gestão do faturamento e histórico completo das compras dos clientes.
          </p>
        </div>
        <BaseButton @click="store.abrirCriacao()" variant="primary" class="mt-4 sm:mt-0 flex items-center justify-center gap-2 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600">
          <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          Nova Venda
        </BaseButton>
      </div>

      <!-- Main Content -->
      <div class="flex-1 animate-in fade-in slide-in-from-bottom-4 duration-700 overflow-x-hidden">
        <VendasTable />
      </div>

      <!-- Pagination (Implementação Futura Desejável) -->
      <div class="mt-6 flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-800" v-if="store.totalItems > store.itemsPerPage">
        <span class="text-sm text-gray-600 dark:text-gray-400">
          Mostrando {{ (store.currentPage - 1) * store.itemsPerPage + 1 }} a {{ Math.min(store.currentPage * store.itemsPerPage, store.totalItems) }} de {{ store.totalItems }} vendas
        </span>
        <div class="flex gap-2">
          <BaseButton 
            @click="store.currentPage--; store.fetchVendas()" 
            :disabled="store.currentPage === 1"
            variant="outline"
            class="text-sm font-medium"
          >
            Anterior
          </BaseButton>
          <BaseButton 
            @click="store.currentPage++; store.fetchVendas()" 
            :disabled="store.currentPage * store.itemsPerPage >= store.totalItems"
            variant="outline"
            class="text-sm font-medium"
          >
            Próximo
          </BaseButton>
        </div>
      </div>
    </div>
    
    <!-- Modal -->
    <VendasCreateModal />
  </main>
</template>
