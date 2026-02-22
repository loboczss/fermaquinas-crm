<script setup lang="ts">
import { useVendasStore } from '~/stores/useVendasStore'
import { useAuthStore } from '~/stores/useAuthStore'
import { formatClientName } from '~/utils/formatters'
import { format } from 'date-fns'

const store = useVendasStore()
const authStore = useAuthStore()

const formatCurrency = (value: number | null) => {
  if (!value) return 'R$ 0,00'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  return format(new Date(dateString), 'dd/MM/yyyy HH:mm')
}
</script>

<template>
  <div class="mt-4 flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 w-full overflow-hidden">
    <div class="overflow-x-auto">
      <div class="inline-block min-w-full align-middle">
        <div class="overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead class="bg-gray-50/50 dark:bg-gray-800/50">
              <tr>
                <th scope="col" class="py-4 pl-4 pr-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 sm:pl-6">Data/Hora</th>
                <th scope="col" class="px-3 py-4 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Cliente</th>
                <th v-if="authStore.isMaster" scope="col" class="px-3 py-4 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Vendedor</th>
                <th scope="col" class="px-3 py-4 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Produtos</th>
                <th scope="col" class="px-3 py-4 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Valor</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
              <!-- Loading State -->
              <template v-if="store.isLoading && store.vendas.length === 0">
                <tr v-for="i in store.itemsPerPage" :key="'skeleton-'+i" class="animate-pulse bg-gray-50/50 dark:bg-gray-800/30">
                  <td class="whitespace-nowrap py-5 pl-4 pr-3 sm:pl-6"><div class="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
                  <td class="whitespace-nowrap px-3 py-5"><div class="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
                  <td v-if="authStore.isMaster" class="whitespace-nowrap px-3 py-5"><div class="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
                  <td class="whitespace-nowrap px-3 py-5"><div class="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
                  <td class="whitespace-nowrap px-3 py-5"><div class="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
                </tr>
              </template>
              
              <!-- Empty State -->
              <tr v-else-if="store.vendas.length === 0">
                <td :colspan="authStore.isMaster ? 5 : 4" class="py-16 text-center text-gray-500 dark:text-gray-400">
                  <svg class="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">Nenhuma venda encontrada</p>
                  <p class="text-sm">Cadastre uma nova venda para começar a acompanhar o faturamento.</p>
                </td>
              </tr>
              
              <!-- Data Rows -->
              <tr 
                v-else
                v-for="venda in store.vendas" 
                :key="venda.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                :class="{ 'opacity-50 pointer-events-none': store.isLoading }"
              >
                <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-500 dark:text-gray-400 sm:pl-6">
                  {{ formatDate(venda.created_at) }}
                </td>
                <td class="whitespace-nowrap px-3 py-4">
                  <div class="flex flex-col">
                    <span class="font-medium text-gray-900 dark:text-white">
                      {{ formatClientName(venda.cliente?.nome || venda.contact_name, venda.cliente?.nome_social) }}
                    </span>
                    <span class="text-xs text-gray-500 dark:text-gray-400">{{ venda.contato_id }}</span>
                  </div>
                </td>
                <td v-if="authStore.isMaster" class="whitespace-nowrap px-3 py-4 text-sm text-gray-600 dark:text-gray-300">
                  <div class="flex flex-col">
                    <span>{{ venda.vendedor || '-' }}</span>
                    <span v-if="venda.vendedor_id" class="text-xs text-gray-400">ID Autenticado</span>
                    <span v-else class="text-xs text-gray-400">Robô/Externo</span>
                  </div>
                </td>
                <td class="px-3 py-4 text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate" :title="venda.produtos || ''">
                  {{ venda.produtos || '-' }}
                </td>
                <td class="whitespace-nowrap px-3 py-4 text-sm font-semibold text-green-600 dark:text-green-500">
                  {{ formatCurrency(venda.valor_venda) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
