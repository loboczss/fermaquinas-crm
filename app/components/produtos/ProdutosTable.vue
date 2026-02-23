<script setup lang="ts">
import { ref } from 'vue'
import { useProdutosStore } from '~/stores/useProdutosStore'
import { useAuthStore } from '~/stores/useAuthStore'
import type { IProduto } from '~/types/api.types'
import ProdutosEditModal from './ProdutosEditModal.vue'

const store = useProdutosStore()
const authStore = useAuthStore()

// Estado para modais
const showEditModal = ref(false)
const selectedProduto = ref<IProduto | null>(null)
const showDeleteConfirm = ref(false)
const produtoToDelete = ref<IProduto | null>(null)
const deleteLoading = ref(false)

const formatCurrency = (value: string | null) => {
  if (!value) return 'R$ 0,00'
  const num = parseFloat(value)
  if (isNaN(num)) return `R$ ${value}`
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num)
}

const openEditModal = (produto: IProduto) => {
  selectedProduto.value = { ...produto }
  showEditModal.value = true
}

const openDeleteConfirm = (produto: IProduto) => {
  produtoToDelete.value = produto
  showDeleteConfirm.value = true
}

const confirmDelete = async () => {
  if (!produtoToDelete.value?.IDPRODUTO) return
  
  deleteLoading.value = true
  const toast = typeof useToast !== 'undefined' ? (useToast as any)() : { success: (m:string) => alert(m), error: (m:string) => alert(m) }

  try {
    await store.deleteProduto(produtoToDelete.value.IDPRODUTO)
    toast.success('Produto removido com sucesso')
    showDeleteConfirm.value = false
    produtoToDelete.value = null
  } catch (err: any) {
    toast.error(err.data?.message || 'Erro ao remover produto')
  } finally {
    deleteLoading.value = false
  }
}
</script>

<template>
  <div class="mt-4 flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 w-full overflow-hidden flex-1">
    <div class="overflow-x-auto">
      <div class="inline-block min-w-full align-middle">
        <div class="overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead class="bg-gray-50/50 dark:bg-gray-800/50">
              <tr>
                <th scope="col" class="py-4 pl-4 pr-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 sm:pl-6">ID / Sub</th>
                <th scope="col" class="px-3 py-4 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Descrição</th>
                <th scope="col" class="px-3 py-4 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Modelo</th>
                <th scope="col" class="px-3 py-4 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Embalagem</th>
                <th scope="col" class="px-3 py-4 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Preço Varejo</th>
                <th scope="col" class="px-3 py-4 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Estoque</th>
                <th v-if="authStore.isMaster" scope="col" class="px-3 py-4 text-right text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 sm:pr-6">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
              <!-- Loading State -->
              <template v-if="store.loading && store.produtos.length === 0">
                <tr v-for="i in store.limit" :key="'skeleton-produto-'+i" class="animate-pulse bg-gray-50/50 dark:bg-gray-800/30">
                  <td class="whitespace-nowrap py-5 pl-4 pr-3 sm:pl-6"><div class="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
                  <td class="whitespace-nowrap px-3 py-5"><div class="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
                  <td class="whitespace-nowrap px-3 py-5"><div class="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
                  <td class="whitespace-nowrap px-3 py-5"><div class="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
                  <td class="whitespace-nowrap px-3 py-5"><div class="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
                  <td class="whitespace-nowrap px-3 py-5"><div class="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
                  <td v-if="authStore.isMaster" class="whitespace-nowrap px-3 py-5 sm:pr-6"><div class="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded ml-auto"></div></td>
                </tr>
              </template>
              
              <!-- Empty State -->
              <tr v-else-if="store.produtos.length === 0">
                <td :colspan="authStore.isMaster ? 7 : 6" class="py-16 text-center text-gray-500 dark:text-gray-400">
                  <svg class="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">Nenhum produto encontrado</p>
                  <p class="text-sm">Os produtos cadastrados ou resultantes da busca aparecerão aqui.</p>
                </td>
              </tr>
              
              <!-- Data Rows -->
              <tr 
                v-else
                v-for="produto in store.produtos" 
                :key="produto.IDPRODUTO || Math.random()"
                class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                :class="{ 'opacity-50 pointer-events-none': store.loading }"
              >
                <td class="py-4 pl-4 pr-3 text-sm font-medium text-gray-400 dark:text-gray-500 sm:pl-6 whitespace-nowrap">
                  <span class="text-gray-900 dark:text-white">{{ produto.IDPRODUTO }}</span>
                  <span v-if="produto.IDSUBPRODUTO" class="text-xs ml-1 opacity-60">/ {{ produto.IDSUBPRODUTO }}</span>
                </td>
                <td class="py-4 px-3 text-sm font-medium text-gray-900 dark:text-white max-w-sm truncate" :title="produto.DESCRICAO || ''">
                  {{ produto.DESCRICAO || '-' }}
                </td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {{ produto.MODELO || '-' }}
                </td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                  <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                    {{ produto.EMBALAGEMSAIDA || '-' }}
                  </span>
                </td>
                <td class="whitespace-nowrap px-3 py-4 text-sm font-semibold text-accent-600 dark:text-accent-500">
                  {{ formatCurrency(produto.VALPRECOVAREJO) }}
                </td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {{ produto.QTDATUALESTOQUE || '0' }}
                </td>
                <td v-if="authStore.isMaster" class="whitespace-nowrap px-3 py-4 text-right text-sm font-medium sm:pr-6 whitespace-nowrap">
                  <div class="flex justify-end gap-1">
                    <button 
                      @click="openEditModal(produto)"
                      class="p-2 text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-950/30 rounded-lg transition-colors"
                      title="Editar produto"
                    >
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button 
                      @click="openDeleteConfirm(produto)"
                      class="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                      title="Excluir produto"
                    >
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <!-- Pagination Footer -->
    <div class="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3 sm:px-6 mt-auto">
      <div class="flex items-center justify-between">
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700 dark:text-gray-300">
              Mostrando <span class="font-medium">{{ Math.min((store.page - 1) * store.limit + 1, store.total) }}</span> a <span class="font-medium">{{ Math.min(store.page * store.limit, store.total) }}</span> de <span class="font-medium">{{ store.total.toLocaleString('pt-BR') }}</span> resultados
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button 
                @click="store.setPage(store.page - 1)"
                :disabled="store.page === 1"
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span class="sr-only">Anterior</span>
                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
                </svg>
              </button>
              
              <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300">
                Página {{ store.page }} de {{ store.totalPages || 1 }}
              </span>
              
              <button 
                @click="store.setPage(store.page + 1)"
                :disabled="store.page >= store.totalPages || store.totalPages === 0"
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span class="sr-only">Próximo</span>
                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
        
        <!-- Mobile Pagination -->
        <div class="flex items-center justify-between w-full sm:hidden">
          <button 
            @click="store.setPage(store.page - 1)"
            :disabled="store.page === 1"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            Anterior
          </button>
          <span class="text-sm text-gray-700 dark:text-gray-300">
           {{ store.page }} / {{ store.totalPages || 1 }}
          </span>
          <button 
            @click="store.setPage(store.page + 1)"
            :disabled="store.page >= store.totalPages || store.totalPages === 0"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            Próximo
          </button>
        </div>
      </div>
    </div>

    <!-- Modais -->
    <ProdutosEditModal 
      :show="showEditModal"
      :produto="selectedProduto"
      @close="showEditModal = false"
      @updated="store.fetchProdutos()"
    />

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div v-if="showDeleteConfirm" class="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showDeleteConfirm = false"></div>
          
          <div class="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-6 border border-gray-200 dark:border-gray-800">
            <div class="flex flex-col items-center text-center">
              <div class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                <svg class="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Excluir Produto</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Tem certeza que deseja remover o produto <span class="font-semibold text-gray-700 dark:text-gray-300">"{{ produtoToDelete?.DESCRICAO }}"</span>? Esta ação não pode ser desfeita.
              </p>
              
              <div class="flex gap-3 w-full">
                <button 
                  @click="showDeleteConfirm = false"
                  class="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  @click="confirmDelete"
                  :disabled="deleteLoading"
                  class="flex-1 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-bold shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <svg v-if="deleteLoading" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{{ deleteLoading ? 'Excluindo...' : 'Sim, Excluir' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
