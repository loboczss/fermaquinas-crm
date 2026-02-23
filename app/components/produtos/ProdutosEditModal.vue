<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { IProduto } from '~/types/api.types'
import { useProdutosStore } from '~/stores/useProdutosStore'

const props = defineProps<{
  show: boolean
  produto: IProduto | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'updated'): void
}>()

const store = useProdutosStore()
const loading = ref(false)

// Estado reativo para os campos do formulário
const form = reactive({
  IDPRODUTO: 0,
  IDSUBPRODUTO: 0 as number | null,
  DESCRICAO: '',
  MODELO: '',
  EMBALAGEMSAIDA: '',
  VALPRECOVAREJO: '',
  QTDATUALESTOQUE: ''
})

// Sincronizar form quando o produto mudar
watch(() => props.produto, (newProduto) => {
  if (newProduto) {
    form.IDPRODUTO = newProduto.IDPRODUTO || 0
    form.IDSUBPRODUTO = newProduto.IDSUBPRODUTO || null
    form.DESCRICAO = newProduto.DESCRICAO || ''
    form.MODELO = newProduto.MODELO || ''
    form.EMBALAGEMSAIDA = newProduto.EMBALAGEMSAIDA || ''
    form.VALPRECOVAREJO = newProduto.VALPRECOVAREJO || ''
    form.QTDATUALESTOQUE = newProduto.QTDATUALESTOQUE || '0'
  }
}, { immediate: true })

const handleSave = async () => {
  if (!form.DESCRICAO) {
    const toast = typeof useToast !== 'undefined' ? (useToast as any)() : { error: (m:string) => alert(m) }
    toast.error('A descrição é obrigatória')
    return
  }

  loading.value = true
  const toast = typeof useToast !== 'undefined' ? (useToast as any)() : { error: (m:string) => alert(m), success: (m:string) => alert(m) }

  try {
    await store.updateProduto({ ...form })
    toast.success('Produto atualizado com sucesso')
    emit('updated')
    emit('close')
  } catch (err: any) {
    toast.error(err.data?.message || 'Erro ao atualizar produto')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="show" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="emit('close')"></div>

        <!-- Document -->
        <div 
          class="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden transform transition-all border border-gray-200 dark:border-gray-800"
          @click.stop
        >
          <!-- Header -->
          <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/30">
            <div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white">Editar Produto</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">ID: {{ form.IDPRODUTO }} <span v-if="form.IDSUBPRODUTO">/ Sub: {{ form.IDSUBPRODUTO }}</span></p>
            </div>
            <button 
              @click="emit('close')"
              class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            >
              <svg class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Form -->
          <div class="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <!-- Descrição -->
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Descrição</label>
              <input 
                v-model="form.DESCRICAO"
                type="text" 
                class="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 transition-all outline-none text-gray-900 dark:text-white"
                placeholder="Ex: PAR DE LUVAS DE COURO"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <!-- Modelo -->
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Modelo</label>
                <input 
                  v-model="form.MODELO"
                  type="text" 
                  class="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white"
                />
              </div>
              <!-- Embalagem -->
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Embalagem</label>
                <input 
                  v-model="form.EMBALAGEMSAIDA"
                  type="text" 
                  class="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <!-- Preço -->
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Preço Varejo (R$)</label>
                <input 
                  v-model="form.VALPRECOVAREJO"
                  type="text" 
                  class="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white"
                  placeholder="0.00"
                />
              </div>
              <!-- Estoque -->
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Qtd. Estoque</label>
                <input 
                  v-model="form.QTDATUALESTOQUE"
                  type="text" 
                  class="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="p-6 border-t border-gray-100 dark:border-gray-800 flex gap-3 bg-gray-50/50 dark:bg-gray-800/30">
            <button 
              @click="emit('close')"
              class="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button 
              @click="handleSave"
              :disabled="loading"
              class="flex-1 px-4 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white text-sm font-bold shadow-lg shadow-primary-500/20 transition-all flex items-center justify-center gap-2"
            >
              <svg v-if="loading" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{{ loading ? 'Salvando...' : 'Salvar Alterações' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #334155;
}
</style>
