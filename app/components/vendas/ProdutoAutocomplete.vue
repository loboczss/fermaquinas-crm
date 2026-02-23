<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import type { IProduto } from '~/types/api.types'

interface Props {
  modelValue?: IProduto | null
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  placeholder: 'Buscar produto por nome ou código...'
})

const emit = defineEmits(['update:modelValue', 'select'])

const query = ref('')
const suggestions = ref<IProduto[]>([])
const loading = ref(false)
const showDropdown = ref(false)
const hasSearched = ref(false)

let searchTimeout: NodeJS.Timeout | null = null

const searchProducts = async (term: string) => {
  const trimmed = term.trim()
  if (trimmed.length < 2) {
    suggestions.value = []
    return
  }

  loading.value = true
  hasSearched.value = true
  try {
    const result = await $fetch<{ data: IProduto[], total: number }>('/api/produtos/search', {
      params: { q: trimmed, limit: 10 }
    })
    suggestions.value = result.data
  } catch (err) {
    console.error('[Autocomplete] Search error:', err)
    suggestions.value = []
  } finally {
    loading.value = false
  }
}

const onInput = (e: Event) => {
  const value = (e.target as HTMLInputElement).value
  query.value = value
  showDropdown.value = true
  
  if (searchTimeout) clearTimeout(searchTimeout)
  
  if (value.length < 2) {
    suggestions.value = []
    return
  }
  
  searchTimeout = setTimeout(() => {
    searchProducts(value)
  }, 400)
}

const selectItem = (product: IProduto) => {
  query.value = product.DESCRICAO || ''
  emit('update:modelValue', product)
  emit('select', product)
  showDropdown.value = false
  suggestions.value = []
}

const clear = () => {
  query.value = ''
  emit('update:modelValue', null)
  suggestions.value = []
  showDropdown.value = false
}

const formatCurrency = (value: string | null) => {
  if (!value) return 'R$ 0,00'
  const num = parseFloat(value)
  if (isNaN(num)) return `R$ ${value}`
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num)
}

// Click outside logic
const wrapper = ref<HTMLElement | null>(null)
const handleClickOutside = (event: MouseEvent) => {
  if (wrapper.value && !wrapper.value.contains(event.target as Node)) {
    showDropdown.value = false
  }
}

onMounted(() => {
  window.addEventListener('mousedown', handleClickOutside)
  if (props.modelValue) {
    query.value = props.modelValue.DESCRICAO || ''
  }
})

onUnmounted(() => {
  window.removeEventListener('mousedown', handleClickOutside)
})

// Sync query if modelValue changes externally
watch(() => props.modelValue, (newVal) => {
  if (!newVal) {
    query.value = ''
  } else if (newVal.DESCRICAO !== query.value) {
    query.value = newVal.DESCRICAO || ''
  }
})
</script>

<template>
  <div ref="wrapper" class="relative">
    <div class="relative">
      <input
        type="text"
        :value="query"
        @input="onInput"
        @focus="showDropdown = true"
        :placeholder="placeholder"
        class="block w-full rounded-xl border-secondary-300 dark:border-dark-border bg-white dark:bg-dark-surface text-secondary-900 dark:text-dark-text shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm h-10 pl-3 pr-10 transition-colors"
      />
      
      <!-- Clear/Search Icon -->
      <div class="absolute inset-y-0 right-0 flex items-center pr-3">
        <button 
          v-if="query" 
          @click="clear"
          type="button"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <svg v-else class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>

    <!-- Dropdown -->
    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div 
        v-if="showDropdown && (loading || suggestions.length > 0 || (query.length >= 2 && hasSearched))"
        class="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-xl bg-white dark:bg-gray-800 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-100 dark:border-gray-700"
      >
        <!-- Loading -->
        <div v-if="loading" class="py-3 px-4 text-sm text-gray-500 text-center flex items-center justify-center gap-2">
          <svg class="animate-spin h-4 w-4 text-primary-500" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Buscando produtos...
        </div>

        <!-- Suggestions -->
        <ul v-else-if="suggestions.length > 0">
          <li
            v-for="product in suggestions"
            :key="product.IDPRODUTO + '-' + (product.IDSUBPRODUTO || '0')"
            @mousedown.prevent="selectItem(product)"
            class="relative cursor-pointer select-none py-3 pl-4 pr-4 text-sm hover:bg-primary-50 dark:hover:bg-primary-900/20 text-gray-900 dark:text-gray-200 transition-colors border-b border-gray-50 dark:border-gray-700/50 last:border-0"
          >
            <div class="flex justify-between items-start">
              <div class="flex flex-col flex-1 min-w-0 pr-2">
                <span class="font-medium truncate block">
                  <span class="text-xs text-primary-600 dark:text-primary-400 font-bold">[{{ product.IDPRODUTO }}]</span>
                  {{ product.DESCRICAO }}
                </span>
                <span class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Estoque: {{ product.QTDATUALESTOQUE || '0' }} {{ product.EMBALAGEMSAIDA }}
                  <span v-if="product.MODELO" class="ml-2">• Mod: {{ product.MODELO }}</span>
                </span>
              </div>
              <div class="text-right flex flex-col items-end">
                <span class="font-bold text-accent-600 dark:text-accent-500">
                  {{ formatCurrency(product.VALPRECOVAREJO) }}
                </span>
              </div>
            </div>
          </li>
        </ul>

        <!-- Empty State -->
        <div v-else-if="query.length >= 2 && !loading" class="py-4 px-4 text-center">
          <p class="text-sm text-gray-500 dark:text-gray-400">Nenhum produto encontrado.</p>
        </div>
      </div>
    </transition>
  </div>
</template>
