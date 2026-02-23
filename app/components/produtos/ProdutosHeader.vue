<script setup lang="ts">
import { ref, watch } from 'vue'
import { useProdutosStore } from '~/stores/useProdutosStore'
import { useToast } from '~/composables/useToast'
import ProdutosUpload from './ProdutosUpload.vue'

const store = useProdutosStore()
const toast = useToast()
const localSearch = ref('')
const exportando = ref(false)

const exportarProdutos = async (formato: 'xlsx' | 'csv') => {
  exportando.value = true
  try {
    const response = await $fetch(`/api/produtos/exportar`, {
      params: { formato },
      responseType: 'blob', // Importante para download de arquivo
    })

    // Criar link de download
    const blob = new Blob([response as any])
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `produtos_fermaquinas.${formato}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    toast.success('Arquivo exportado com sucesso!')
  } catch (err: any) {
    console.error(err)
    toast.error('Erro ao exportar produtos')
  } finally {
    exportando.value = false
  }
}

// Debounce customizado de 400ms para a busca
let timeoutId: ReturnType<typeof setTimeout> | null = null

const handleSearch = (query: string) => {
  if (timeoutId) clearTimeout(timeoutId)
  timeoutId = setTimeout(() => {
    store.searchProdutos(query, 1) // Reseta para a página 1 em nova busca
  }, 400)
}

watch(localSearch, (newVal) => {
  handleSearch(newVal)
})
const dropdownItems = computed(() => [
  {
    label: 'Exportar XLSX',
    onClick: () => exportarProdutos('xlsx')
  },
  {
    label: 'Exportar CSV',
    onClick: () => exportarProdutos('csv')
  }
])
</script>

<template>
  <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between shrink-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
    <div>
      <h1 class="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
        <svg class="w-8 h-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        Produtos
      </h1>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
        Catálogo de produtos disponíveis (Total: {{ store.total.toLocaleString('pt-BR') }} itens)
      </p>
    </div>
    
    <div class="mt-4 sm:mt-0 relative w-full sm:w-auto flex flex-col gap-3 items-end">
      <div class="flex items-center gap-2">
        <!-- Botão de Exportação -->
        <BaseDropdown :items="dropdownItems">
          <template #trigger="{ isOpen }">
            <BaseButton
              :disabled="exportando"
              variant="outline"
              class="flex items-center gap-2"
            >
              <svg v-if="exportando" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              {{ exportando ? 'Exportando...' : 'Exportar' }}
              <svg class="w-4 h-4 transition-transform duration-200" :class="{ 'rotate-180': isOpen }" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </BaseButton>
          </template>
        </BaseDropdown>

        <!-- Botão de Upload Renderizado aqui (aparece apenas pra master dentro do component) -->
        <ProdutosUpload @updated="store.fetchProdutos()" />
      </div>

      <div class="relative w-full">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" />
          </svg>
        </div>
        <BaseInput 
          v-model="localSearch"
          placeholder="Buscar por descrição ou modelo..." 
          class="pl-10"
        />
      </div>
    </div>
  </div>
</template>
