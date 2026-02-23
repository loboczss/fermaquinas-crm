<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '~/stores/useAuthStore'
import { useProdutosStore } from '~/stores/useProdutosStore'

const authStore = useAuthStore()
const produtosStore = useProdutosStore()

const emit = defineEmits<{
  (e: 'updated'): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const loading = ref(false)

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    if (file) {
      selectedFile.value = file
    }
  }
}

const triggerFileInput = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

const cancelSelection = () => {
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const uploadFile = async () => {
  if (!selectedFile.value) return

  loading.value = true
  const toast = typeof useToast !== 'undefined' ? useToast() : { 
    success: (m:string) => alert(`Sucesso: ${m}`), 
    error: (m:string) => alert(`Erro: ${m}`)
  }

  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)

    const result = await $fetch<{ success: boolean; total: number }>('/api/produtos/upload', {
      method: 'POST',
      body: formData,
    })

    toast.success(`${result.total} produtos atualizados no catálogo!`)
    emit('updated')
    cancelSelection()

  } catch (err: any) {
    toast.error(err.data?.message || 'Falha ao processar o upload do arquivo.')
  } finally {
    loading.value = false
  }
}

// Se não renderizar nada caso o usuário não for master, garantimos o isolamento no DOM
// Contudo, como v-if na directiva invoca na importação de quem chama é melhor exportar puro e prever props/events
</script>

<template>
  <div v-if="authStore.isMaster" class="flex items-center gap-2">
    <!-- Input Invisível -->
    <input 
      type="file" 
      ref="fileInput"
      accept=".xlsx"
      class="hidden"
      @change="handleFileSelect"
    />

    <!-- Estado 1: Botão Padrão para Iniciar a Escolha -->
    <BaseButton 
      v-if="!selectedFile && !loading"
      @click="triggerFileInput"
      variant="outline"
      class="flex items-center gap-2"
      title="O upload sobreescreve todos os produtos atuais com os arquivos da planilha"
    >
      <svg class="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
      Importar Produtos
    </BaseButton>

    <!-- Estado 2 e 3: Arquivo Selecionado e Botão de Envio/Loader -->
    <div v-else class="flex flex-col sm:flex-row items-center gap-2 bg-gray-50 dark:bg-gray-800/80 p-2 rounded-xl border border-gray-200 dark:border-gray-700">
      
      <!-- Label do Arquivo -->
      <div v-if="selectedFile" class="flex items-center gap-2 px-2 max-w-[200px]">
        <svg class="h-4 w-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="text-xs text-gray-700 dark:text-gray-300 truncate font-medium">
          {{ selectedFile.name }}
        </span>
      </div>

      <div class="flex items-center gap-1 w-full sm:w-auto mt-2 sm:mt-0">
         <!-- Botão Cancela -->
        <BaseButton 
          v-if="!loading"
          @click="cancelSelection"
          variant="outline"
          class="!py-1.5 !px-3 text-xs"
        >
          Cancelar
        </BaseButton>

        <!-- Botão Enviar com Loader -->
        <BaseButton 
          @click="uploadFile"
          :loading="loading"
          variant="primary"
          class="!py-1.5 !px-3 text-xs"
        >
          Atualizar Base
        </BaseButton>
      </div>

    </div>
  </div>
</template>
