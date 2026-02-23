<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useVendasStore } from '~/stores/useVendasStore'
import { useCrmStore } from '~/stores/useCrmStore'
import { useToast } from '~/composables/useToast'
import type { IProduto } from '~/types/api.types'
import ProdutoAutocomplete from './ProdutoAutocomplete.vue'

/* ──────────────────── Types ──────────────────── */
interface IVendaProduto {
  produto: IProduto
  quantidade: number
  precoUnitario: number
  subtotal: number
}

interface FieldErrors {
  cliente: string | null
  produto: string | null
  quantidade: string | null
  produtosList: string | null
}

/* ──────────────────── Stores ──────────────────── */
const store = useVendasStore()
const crmStore = useCrmStore()
const toast = useToast()

/* ──────────────────── Form State ──────────────────── */
const formData = ref({
  contato_id: '',
  contact_name: '',
  vendedor: '',
  observacoes: '',
  produtos_json: [] as IVendaProduto[]
})

/* ──────────────────── Cliente Search ──────────────────── */
const clientSearchTerm = ref('')
const searchResults = ref<any[]>([])
const isSearchingClient = ref(false)
const showClientDropdown = ref(false)
let clientSearchTimeout: any = null

watch(clientSearchTerm, (newTerm) => {
  if (formData.value.contato_id && newTerm.includes(formData.value.contato_id)) return
  const term = newTerm.trim()
  if (term.length < 2) { searchResults.value = []; return }
  isSearchingClient.value = true
  clearTimeout(clientSearchTimeout)
  clientSearchTimeout = setTimeout(async () => {
    try {
      const data = await $fetch<any[]>('/api/crm/search', { query: { q: term, limit: 10 } })
      if (data) searchResults.value = data
    } catch { /* silently fail */ } finally { isSearchingClient.value = false }
  }, 400)
})

const filteredClientes = computed(() => {
  if (!clientSearchTerm.value) return crmStore.clientes.slice(0, 5)
  return searchResults.value
})

const selectClient = (c: any) => {
  formData.value.contato_id = c.contato_id
  formData.value.contact_name = c.nome || c.nome_social || ''
  clientSearchTerm.value = `${formData.value.contact_name} (${c.contato_id})`
  showClientDropdown.value = false
  errors.value.cliente = null
}

const onClientInputChange = () => {
  formData.value.contato_id = ''
  showClientDropdown.value = true
}

/* ──────────────────── Produto Selection ──────────────────── */
const currentProduct = ref<IProduto | null>(null)
const currentQty = ref(1)

const currentPrice = computed(() => {
  if (!currentProduct.value) return 0
  return parseFloat(currentProduct.value.VALPRECOVAREJO || '0')
})

const currentSubtotal = computed(() => currentPrice.value * currentQty.value)

const currentEstoque = computed(() => {
  if (!currentProduct.value) return 0
  return parseInt(currentProduct.value.QTDATUALESTOQUE || '0', 10)
})

const estoqueWarning = computed(() =>
  currentProduct.value && currentQty.value > currentEstoque.value
)

const onProductSelected = (p: IProduto) => {
  currentProduct.value = p
  currentQty.value = 1
  errors.value.produto = null
}

const addProductToList = () => {
  if (!currentProduct.value) { errors.value.produto = 'Selecione um produto antes de adicionar'; triggerShake('produto'); return }
  if (currentQty.value < 1 || !Number.isInteger(currentQty.value)) { errors.value.quantidade = 'Informe uma quantidade válida (mínimo 1)'; triggerShake('quantidade'); return }

  formData.value.produtos_json.push({
    produto: { ...currentProduct.value },
    quantidade: currentQty.value,
    precoUnitario: currentPrice.value,
    subtotal: currentSubtotal.value
  })

  currentProduct.value = null
  currentQty.value = 1
  errors.value.produtosList = null
}

const removeProduct = (index: number) => {
  formData.value.produtos_json.splice(index, 1)
}

/* ──────────────────── Totals ──────────────────── */
const totalVenda = computed(() =>
  formData.value.produtos_json.reduce((sum, item) => sum + item.subtotal, 0)
)

/* ──────────────────── Formatting ──────────────────── */
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

/* ──────────────────── Validation ──────────────────── */
const errors = ref<FieldErrors>({
  cliente: null,
  produto: null,
  quantidade: null,
  produtosList: null,
})

const shakeFields = ref<Record<string, boolean>>({})
const triggerShake = (field: string) => {
  shakeFields.value[field] = true
  setTimeout(() => { shakeFields.value[field] = false }, 450)
}

const touched = ref<Record<string, boolean>>({})
const onBlur = (field: keyof FieldErrors) => {
  touched.value[field] = true
  validateField(field)
}

const validateField = (field: keyof FieldErrors) => {
  switch (field) {
    case 'cliente':
      errors.value.cliente = !formData.value.contato_id ? 'Selecione um cliente da lista de sugestões' : null
      break
    case 'produtosList':
      errors.value.produtosList = formData.value.produtos_json.length === 0 ? 'Adicione pelo menos um produto à venda' : null
      break
  }
}

const validateAll = (): boolean => {
  validateField('cliente')
  validateField('produtosList')
  const hasErrors = Object.values(errors.value).some(e => e !== null)
  if (hasErrors) {
    // Trigger shakes for fields that have errors
    if (errors.value.cliente) triggerShake('cliente')
    if (errors.value.produtosList) triggerShake('produtosList')
    // Scroll to first error
    nextTick(() => {
      const firstError = document.querySelector('.field-error-text')
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }
  return !hasErrors
}

/* ──────────────────── Save ──────────────────── */
const isSubmitting = ref(false)

const handleSave = async () => {
  if (!validateAll()) return

  isSubmitting.value = true
  try {
    const produtosString = formData.value.produtos_json
      .map(p => `${p.quantidade}x ${p.produto.DESCRICAO} (${formatCurrency(p.precoUnitario)})`)
      .join(', ')

    await store.criarVenda({
      contato_id: formData.value.contato_id,
      contact_name: formData.value.contact_name,
      valor_venda: Number(totalVenda.value.toFixed(2)),
      produtos: produtosString,
      vendedor: formData.value.vendedor || undefined,
    })

    resetForm()
  } catch {
    // Store already shows toast.error
  } finally {
    isSubmitting.value = false
  }
}

/* ──────────────────── Close / Reset ──────────────────── */
const formHasData = computed(() =>
  !!formData.value.contato_id || formData.value.produtos_json.length > 0
)

const handleClose = () => {
  if (formHasData.value) {
    if (!window.confirm('Tem certeza? Os dados serão perdidos.')) return
  }
  resetForm()
  store.fecharCriacao()
}

const resetForm = () => {
  formData.value = { contato_id: '', contact_name: '', vendedor: '', observacoes: '', produtos_json: [] }
  clientSearchTerm.value = ''
  currentProduct.value = null
  currentQty.value = 1
  errors.value = { cliente: null, produto: null, quantidade: null, produtosList: null }
  touched.value = {}
}

/* ──────────────────── Init ──────────────────── */
onMounted(() => {
  if (crmStore.clientes.length === 0) crmStore.fetchClientes()
})
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <transition
      enter-active-class="ease-out duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="store.isCreateModalOpen"
        id="venda-modal-backdrop"
        class="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
        @click.self="handleClose"
      >
        <!-- Modal Panel -->
        <transition
          enter-active-class="transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
          enter-from-class="opacity-0 translate-y-5 scale-[0.98]"
          enter-to-class="opacity-100 translate-y-0 scale-100"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 translate-y-0 scale-100"
          leave-to-class="opacity-0 translate-y-4 scale-95"
        >
          <div
            v-if="store.isCreateModalOpen"
            id="venda-modal-panel"
            class="fixed inset-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 flex flex-col bg-white dark:bg-slate-900 md:rounded-2xl md:shadow-2xl md:max-w-2xl md:w-full md:max-h-[90vh] overflow-hidden z-[101]"
          >
            <!-- ═══ HEADER (sticky) ═══ -->
            <div id="venda-modal-header" class="flex-shrink-0">
              <!-- Top accent bar -->
              <div class="h-1 bg-gradient-to-r from-primary-400 via-primary-500 to-accent-500"></div>

              <div class="px-5 py-4 sm:px-6 flex items-start justify-between gap-4">
                <div class="flex items-center gap-3 min-w-0">
                  <div class="flex-shrink-0 h-10 w-10 rounded-xl bg-accent-50 dark:bg-accent-900/20 flex items-center justify-center">
                    <svg class="h-5 w-5 text-accent-600 dark:text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
                  </div>
                  <div class="min-w-0">
                    <h2 class="text-lg font-bold text-slate-900 dark:text-white truncate">Registrar Nova Venda</h2>
                    <p class="text-xs text-slate-500 dark:text-slate-400">Vincule um cliente, adicione produtos e finalize.</p>
                  </div>
                </div>
                <button
                  @click="handleClose"
                  type="button"
                  aria-label="Fechar modal"
                  class="flex-shrink-0 h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
                >
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>

            <!-- ═══ BODY (scrollable) ═══ -->
            <div id="venda-modal-body" class="flex-1 overflow-y-auto px-5 sm:px-6 pb-4 space-y-6">

              <!-- ── SEÇÃO 1: CLIENTE ── -->
              <section id="section-cliente">
                <div class="flex items-center gap-2 mb-3">
                  <span class="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">Cliente</span>
                  <div class="flex-1 h-px bg-slate-200 dark:bg-slate-700/50"></div>
                </div>

                <div class="relative" :class="{ 'animate-shake': shakeFields.cliente }">
                  <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Cliente (Contato) <span class="text-red-500">*</span>
                  </label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <svg class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <input
                      id="input-cliente"
                      v-model="clientSearchTerm"
                      @focus="showClientDropdown = true"
                      @input="onClientInputChange"
                      @blur="onBlur('cliente')"
                      type="text"
                      placeholder="Buscar por nome ou número..."
                      autocomplete="off"
                      class="block w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-200 text-sm focus:outline-none focus:ring-2"
                      :class="errors.cliente
                        ? 'border-red-400 dark:border-red-500 focus:ring-red-500/30 focus:border-red-500'
                        : formData.contato_id
                          ? 'border-green-300 dark:border-green-600 focus:ring-green-500/30 focus:border-green-400 bg-green-50/30 dark:bg-green-900/10'
                          : 'border-slate-200 dark:border-slate-700 focus:ring-primary-500/30 focus:border-primary-400 bg-white dark:bg-slate-800'"
                    />
                    <!-- Checkmark if valid -->
                    <div v-if="formData.contato_id" class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg class="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </div>
                  </div>

                  <!-- Client Dropdown -->
                  <ul
                    v-if="showClientDropdown && (filteredClientes.length > 0 || isSearchingClient)"
                    class="absolute z-[60] mt-1.5 max-h-48 w-full overflow-auto rounded-xl bg-white dark:bg-slate-800 shadow-xl ring-1 ring-slate-200 dark:ring-slate-700 py-1"
                  >
                    <li v-if="isSearchingClient" class="py-3 px-4 text-sm text-slate-400 text-center flex items-center justify-center gap-2">
                      <svg class="animate-spin h-4 w-4 text-primary-500" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                      Buscando...
                    </li>
                    <li
                      v-for="c in filteredClientes"
                      :key="c.id"
                      @mousedown.prevent="selectClient(c)"
                      class="cursor-pointer px-4 py-2.5 text-sm hover:bg-primary-50 dark:hover:bg-primary-900/20 text-slate-900 dark:text-slate-200 transition-colors"
                    >
                      <span class="font-medium">{{ c.nome || c.nome_social || 'S/ Nome' }}</span>
                      <span class="ml-2 text-[10px] text-slate-400 tracking-wider">{{ c.contato_id }}</span>
                    </li>
                  </ul>

                  <!-- Error -->
                  <p v-if="errors.cliente" class="field-error-text mt-1.5 text-xs text-red-500 flex items-center gap-1">
                    <svg class="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                    {{ errors.cliente }}
                  </p>
                </div>
              </section>

              <!-- ── SEÇÃO 2: PRODUTOS ── -->
              <section id="section-produtos">
                <div class="flex items-center gap-2 mb-3">
                  <span class="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">Produtos</span>
                  <div class="flex-1 h-px bg-slate-200 dark:bg-slate-700/50"></div>
                </div>

                <!-- Add Product Card -->
                <div
                  id="add-product-card"
                  class="border border-slate-200 dark:border-slate-700 rounded-xl p-4 md:p-5 bg-slate-50/50 dark:bg-slate-800/30"
                  :class="{ 'animate-shake': shakeFields.produto }"
                >
                  <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Buscar Produto <span class="text-red-500">*</span>
                  </label>
                  <ProdutoAutocomplete
                    v-model="currentProduct"
                    @select="onProductSelected"
                    placeholder="Nome ou código do produto..."
                  />
                  <p v-if="errors.produto" class="field-error-text mt-1.5 text-xs text-red-500 flex items-center gap-1">
                    <svg class="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                    {{ errors.produto }}
                  </p>

                  <!-- Qty / Price / Subtotal Row -->
                  <div v-if="currentProduct" class="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div :class="{ 'animate-shake': shakeFields.quantidade }">
                      <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Quantidade</label>
                      <input
                        id="input-qty"
                        v-model.number="currentQty"
                        type="number"
                        min="1"
                        @blur="onBlur('quantidade')"
                        class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
                      />
                      <p v-if="errors.quantidade" class="field-error-text mt-1 text-xs text-red-500">{{ errors.quantidade }}</p>
                      <!-- Estoque warning -->
                      <p v-if="estoqueWarning" class="mt-1 text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium">
                        <svg class="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                        Acima do estoque ({{ currentEstoque }} UN)
                      </p>
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Preço Unit.</label>
                      <div class="flex items-center h-[42px] px-3 rounded-xl border border-slate-100 dark:border-slate-700/50 bg-slate-100 dark:bg-slate-800/80 text-sm font-semibold text-accent-700 dark:text-accent-400">
                        {{ formatCurrency(currentPrice) }}
                      </div>
                      <p class="mt-1 text-[10px] text-slate-400">Estoque: {{ currentEstoque }} {{ currentProduct?.EMBALAGEMSAIDA || 'UN' }}</p>
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Subtotal</label>
                      <div class="flex items-center h-[42px] px-3 rounded-xl border border-slate-100 dark:border-slate-700/50 bg-slate-100 dark:bg-slate-800/80 text-sm font-bold text-slate-900 dark:text-white">
                        {{ formatCurrency(currentSubtotal) }}
                      </div>
                    </div>
                  </div>

                  <!-- Add Button -->
                  <div class="mt-4 flex justify-end">
                    <button
                      id="btn-add-produto"
                      @click="addProductToList"
                      type="button"
                      class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm border-2 border-dashed transition-colors"
                      :class="currentProduct
                        ? 'border-accent-400 text-accent-600 dark:text-accent-400 hover:bg-accent-50 dark:hover:bg-accent-900/20'
                        : 'border-slate-300 dark:border-slate-600 text-slate-400 cursor-not-allowed'"
                      :disabled="!currentProduct"
                    >
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" /></svg>
                      Adicionar Produto
                    </button>
                  </div>
                </div>

                <!-- Added Products List -->
                <div class="mt-4" :class="{ 'animate-shake': shakeFields.produtosList }">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-xs font-bold text-slate-600 dark:text-slate-300">Produtos Adicionados</span>
                    <span v-if="formData.produtos_json.length" class="inline-flex items-center justify-center h-5 px-1.5 rounded-full bg-accent-100 dark:bg-accent-900/30 text-[10px] font-bold text-accent-700 dark:text-accent-300">
                      {{ formData.produtos_json.length }}
                    </span>
                  </div>

                  <!-- Empty State -->
                  <div
                    v-if="formData.produtos_json.length === 0"
                    class="rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 py-8 text-center"
                  >
                    <svg class="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                    <p class="mt-2 text-sm text-slate-400 dark:text-slate-500 font-medium">Nenhum produto adicionado ainda</p>
                    <p class="text-xs text-slate-400/70 dark:text-slate-600">Busque e adicione produtos acima.</p>
                  </div>

                  <!-- Product Items -->
                  <TransitionGroup
                    v-else
                    name="product-list"
                    tag="div"
                    class="space-y-2"
                  >
                    <div
                      v-for="(item, idx) in formData.produtos_json"
                      :key="'produto-' + idx + '-' + item.produto.IDPRODUTO"
                      class="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-100 dark:border-slate-700 hover:shadow-sm transition-shadow group"
                    >
                      <div class="flex items-start justify-between gap-2">
                        <div class="flex-1 min-w-0">
                          <div class="flex items-center gap-2 mb-0.5">
                            <span class="text-[10px] font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-1.5 py-0.5 rounded">#{{ item.produto.IDPRODUTO }}</span>
                          </div>
                          <p class="text-sm font-medium text-slate-900 dark:text-white truncate">{{ item.produto.DESCRICAO }}</p>
                          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {{ item.quantidade }}x · {{ formatCurrency(item.precoUnitario) }}/un · Subtotal: <span class="font-bold text-slate-700 dark:text-slate-200">{{ formatCurrency(item.subtotal) }}</span>
                          </p>
                        </div>
                        <button
                          @click="removeProduct(idx)"
                          type="button"
                          aria-label="Remover produto"
                          class="flex-shrink-0 p-1.5 rounded-lg text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  </TransitionGroup>

                  <!-- Produtlist Error -->
                  <p v-if="errors.produtosList" class="field-error-text mt-2 text-xs text-red-500 flex items-center gap-1">
                    <svg class="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                    {{ errors.produtosList }}
                  </p>

                  <!-- Total Bar -->
                  <div v-if="formData.produtos_json.length > 0" class="mt-3 bg-slate-900 dark:bg-slate-950 text-white rounded-xl px-5 py-3 flex justify-between items-center">
                    <span class="text-xs font-bold uppercase tracking-widest text-slate-400">Total</span>
                    <span class="text-lg font-black tabular-nums">{{ formatCurrency(totalVenda) }}</span>
                  </div>
                </div>
              </section>

              <!-- ── SEÇÃO 3: INFORMAÇÕES ADICIONAIS ── -->
              <section id="section-info-adicional">
                <div class="flex items-center gap-2 mb-3">
                  <span class="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">Informações Adicionais</span>
                  <div class="flex-1 h-px bg-slate-200 dark:bg-slate-700/50"></div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label for="input-vendedor" class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Vendedor <span class="text-xs font-normal text-slate-400">(opcional)</span></label>
                    <input
                      id="input-vendedor"
                      v-model="formData.vendedor"
                      type="text"
                      placeholder="Nome do vendedor..."
                      class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
                    />
                  </div>
                  <div>
                    <label for="input-obs" class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Observações <span class="text-xs font-normal text-slate-400">(opcional)</span></label>
                    <textarea
                      id="input-obs"
                      v-model="formData.observacoes"
                      rows="2"
                      placeholder="Anotações sobre a venda..."
                      class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
                    ></textarea>
                  </div>
                </div>
              </section>
            </div>

            <!-- ═══ FOOTER (sticky) ═══ -->
            <div id="venda-modal-footer" class="flex-shrink-0 border-t border-slate-200 dark:border-slate-700/50 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm px-5 sm:px-6 py-4">
              <div class="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-3">
                <button
                  id="btn-cancel"
                  @click="handleClose"
                  type="button"
                  class="px-6 py-3 rounded-xl font-medium text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-center"
                >
                  Cancelar
                </button>
                <button
                  id="btn-save"
                  @click="handleSave"
                  type="button"
                  :disabled="isSubmitting"
                  class="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-sm text-white bg-accent-600 hover:bg-accent-700 shadow-lg shadow-accent-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  :class="{ 'opacity-60': !formData.contato_id || formData.produtos_json.length === 0 }"
                >
                  <svg v-if="isSubmitting" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                  <svg v-else class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
                  <template v-if="isSubmitting">Salvando...</template>
                  <template v-else>
                    Finalizar Venda
                    <span v-if="totalVenda > 0" class="ml-1 opacity-80">· {{ formatCurrency(totalVenda) }}</span>
                  </template>
                </button>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
/* Shake animation */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-6px); }
  40%, 80% { transform: translateX(6px); }
}
.animate-shake {
  animation: shake 0.4s ease-in-out;
}

/* Product list transitions */
.product-list-enter-active {
  transition: all 0.25s ease-out;
}
.product-list-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.product-list-leave-active {
  transition: all 0.2s ease-in;
}
.product-list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
.product-list-move {
  transition: transform 0.25s ease;
}
</style>
