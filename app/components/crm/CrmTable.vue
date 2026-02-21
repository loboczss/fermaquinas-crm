<script setup lang="ts">
import { useCrmStore } from '~/stores/useCrmStore'
import { formatClientName } from '~/utils/formatters'
import BadgeUrgency from './BadgeUrgency.vue'
import BadgeSentiment from './BadgeSentiment.vue'

const store = useCrmStore()

const handleRowClick = (cliente: any) => {
  store.selecionarCliente(cliente)
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
                <th scope="col" class="py-4 pl-4 pr-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 sm:pl-6">Cliente</th>
                <th scope="col" class="px-3 py-4 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Cidade</th>
                <th scope="col" class="px-3 py-4 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Fase da Obra</th>
                <th scope="col" class="px-3 py-4 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Sentimento</th>
                <th scope="col" class="px-3 py-4 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Urgência</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
              <!-- Loading State -->
              <template v-if="store.isLoading && store.clientes.length === 0">
                <tr v-for="i in store.itemsPerPage" :key="'skeleton-'+i" class="animate-pulse bg-gray-50/50 dark:bg-gray-800/30">
                  <td class="whitespace-nowrap py-5 pl-4 pr-3 sm:pl-6">
                    <div class="flex items-center">
                      <div class="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                      <div class="ml-4 space-y-2">
                        <div class="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div class="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </div>
                    </div>
                  </td>
                  <td class="whitespace-nowrap px-3 py-5"><div class="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
                  <td class="whitespace-nowrap px-3 py-5"><div class="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
                  <td class="whitespace-nowrap px-3 py-5"><div class="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div></td>
                  <td class="whitespace-nowrap px-3 py-5"><div class="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div></td>
                </tr>
              </template>
              <!-- Empty State -->
              <tr v-else-if="store.clientes.length === 0">
                <td colspan="5" class="py-16 text-center text-gray-500 dark:text-gray-400">
                  <svg class="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">Nenhum cliente encontrado</p>
                  <p class="text-sm">Ajuste os filtros de pesquisa para tentar novamente.</p>
                </td>
              </tr>
              <!-- Data Rows -->
              <tr 
                v-else
                v-for="cliente in store.clientes" 
                :key="cliente.id"
                @click="handleRowClick(cliente)"
                class="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors group"
                :class="{ 'opacity-50 pointer-events-none': store.isLoading }"
              >
                <td class="whitespace-nowrap py-5 pl-4 pr-3 sm:pl-6">
                  <div class="flex items-center">
                    <div class="h-10 w-10 flex-shrink-0">
                      <div class="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold border border-primary-200 dark:border-primary-800 group-hover:bg-primary-500 group-hover:text-white transition-colors">
                        {{ formatClientName(cliente.nome, cliente.nome_social).substring(0, 2).toUpperCase() }}
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="font-medium text-gray-900 dark:text-gray-100">{{ formatClientName(cliente.nome, cliente.nome_social) }}</div>
                      <div class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ cliente.contato_id || 'Sem telefone' }}</div>
                    </div>
                  </div>
                </td>
                <td class="whitespace-nowrap px-3 py-5 text-sm text-gray-600 dark:text-gray-400">
                  <div class="flex items-center gap-1.5">
                    <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {{ cliente.cidade || '-' }}
                  </div>
                </td>
                <td class="whitespace-nowrap px-3 py-5 text-sm text-gray-600 dark:text-gray-400">
                  {{ cliente.fase_obra || '-' }}
                </td>
                <td class="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                  <BadgeSentiment :sentimento="cliente.sentimento" />
                </td>
                <td class="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                  <BadgeUrgency :urgencia="cliente.urgencia" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
