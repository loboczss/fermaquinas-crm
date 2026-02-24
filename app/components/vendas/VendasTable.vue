<script setup lang="ts">
import { ref } from 'vue'
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

/* ─── Delete Confirmation ─── */
const showDeleteModal = ref(false)
const deleteTarget = ref<{ id: number; nome: string; valor: number; data: string } | null>(null)
const isDeleting = ref(false)
const devolverItensEstoque = ref(true) // Default to true as it's the expected behavior most of the time


const openDeleteModal = (venda: any) => {
  deleteTarget.value = {
    id: venda.id,
    nome: formatClientName(venda.cliente?.nome || venda.contact_name, venda.cliente?.nome_social),
    valor: venda.valor_venda,
    data: formatDate(venda.created_at)
  }
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  deleteTarget.value = null
}

const confirmDelete = async () => {
  if (!deleteTarget.value) return
  isDeleting.value = true
  try {
    await store.deleteVenda(deleteTarget.value.id, devolverItensEstoque.value)
    closeDeleteModal()
  } catch {
    // store already toasts the error
  } finally {
    isDeleting.value = false
  }
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
                <th v-if="authStore.isMaster" scope="col" class="px-3 py-4 text-right text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 sm:pr-6">Ações</th>
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
                  <td v-if="authStore.isMaster" class="whitespace-nowrap px-3 py-5 sm:pr-6"><div class="h-4 w-14 bg-gray-200 dark:bg-gray-700 rounded ml-auto"></div></td>
                </tr>
              </template>
              
              <!-- Empty State -->
              <tr v-else-if="store.vendas.length === 0">
                <td :colspan="authStore.isMaster ? 6 : 4" class="py-16 text-center text-gray-500 dark:text-gray-400">
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
                <!-- Actions Column (Master Only) -->
                <td v-if="authStore.isMaster" class="whitespace-nowrap px-3 py-4 text-right text-sm sm:pr-6">
                  <BaseButton
                    @click="openDeleteModal(venda)"
                    variant="danger"
                    size="sm"
                    class="inline-flex items-center gap-1"
                    aria-label="Excluir venda"
                  >
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span class="hidden sm:inline">Excluir</span>
                  </BaseButton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <!-- ═══ Delete Confirmation Modal ═══ -->
  <BaseModal
    :model-value="showDeleteModal"
    @update:model-value="closeDeleteModal"
    title="Excluir Venda"
    max-width="md"
  >
    <div class="p-1">
      <!-- Warning Icon -->
      <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
        <svg class="h-7 w-7 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>

      <div class="text-center mb-6">
        <p class="text-slate-600 dark:text-slate-400">Tem certeza que deseja excluir esta venda?<br />Esta ação não pode ser desfeita.</p>
      </div>

      <!-- Venda Info -->
      <div v-if="deleteTarget" class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-2 border border-gray-100 dark:border-gray-800 mb-6">
        <div class="flex justify-between items-center">
          <span class="text-xs text-gray-500 uppercase font-semibold">Cliente</span>
          <span class="text-sm font-medium text-gray-900 dark:text-white">{{ deleteTarget.nome }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-xs text-gray-500 uppercase font-semibold">Valor</span>
          <span class="text-sm font-bold text-green-600 dark:text-green-400">{{ formatCurrency(deleteTarget.valor) }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-xs text-gray-500 uppercase font-semibold">Data</span>
          <span class="text-sm text-gray-600 dark:text-gray-300">{{ deleteTarget.data }}</span>
        </div>
      </div>

      <!-- Stock Return Option -->
      <label class="relative flex items-center gap-3 p-4 bg-primary-50/50 dark:bg-primary-900/10 rounded-xl border border-primary-100 dark:border-primary-900/30 cursor-pointer group hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all mb-8">
        <div class="flex items-center">
          <input 
            v-model="devolverItensEstoque"
            type="checkbox" 
            class="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
          >
        </div>
        <div class="flex flex-col">
          <span class="text-sm font-bold text-primary-900 dark:text-primary-100 italic">Devolver itens ao estoque?</span>
          <span class="text-xs text-primary-600 dark:text-primary-400">As quantidades serão somadas ao saldo atual dos produtos.</span>
        </div>
      </label>

      <!-- Actions -->
      <div class="flex gap-3">
        <BaseButton
          @click="closeDeleteModal"
          :disabled="isDeleting"
          variant="outline"
          class="flex-1"
        >
          Cancelar
        </BaseButton>
        <BaseButton
          @click="confirmDelete"
          :loading="isDeleting"
          variant="danger"
          class="flex-1"
        >
          Excluir Venda
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>
