<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useAgenteStore } from '~/stores/agenteStore'
import BaseButton from '~/components/BaseButton.vue'

const agenteStore = useAgenteStore()
const { isAddingRag, isAddingFile } = storeToRefs(agenteStore)

const newRagContent = ref('')
const selectedFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    if (file) {
      selectedFile.value = file
      newRagContent.value = '' // Limpa o texto se anexar um arquivo
    }
  }
}

const clearSelectedFile = () => {
    selectedFile.value = null
    if (fileInput.value) {
        fileInput.value.value = ''
    }
}

const handleAddRag = async () => {
  if (selectedFile.value) {
      if (isAddingFile.value) return
      
      try {
        await agenteStore.addRagFile(selectedFile.value)
        clearSelectedFile()
      } catch (error) {
         // O erro ja é tratado e logado no store
      }
      return
  }

  if (!newRagContent.value.trim() || isAddingRag.value) return

  try {
    await agenteStore.addRagContent(newRagContent.value)
    newRagContent.value = ''
  } catch (error) {
    // Erro ja tratado no store
  }
}

const isSubmitDisabled = () => {
  return (selectedFile.value === null && !newRagContent.value.trim()) || isAddingRag.value || isAddingFile.value
}
</script>

<template>
  <div class="w-full bg-white dark:bg-dark-surface rounded-3xl p-6 sm:p-8 shadow-sm border border-secondary-200/60 dark:border-dark-border transition-all duration-300 hover:shadow-md">
    <div class="mb-6 flex flex-col gap-1">
      <h3 class="text-xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
        <svg class="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
        Adicionar Conhecimento
      </h3>
      <p class="text-sm text-secondary-500 dark:text-secondary-400">Insira um texto ou anexe um documento (PDF, Imagens, Planilhas) para treinar o agente.</p>
    </div>

    <div class="relative group">
      <!-- Glow effect on focus -->
      <div class="absolute -inset-0.5 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500 pointer-events-none"></div>
      
      <div class="relative flex flex-col sm:flex-row gap-3 bg-white dark:bg-[#1a1a1a] rounded-2xl p-1.5 border border-secondary-200 dark:border-dark-border focus-within:border-primary-500/50 dark:focus-within:border-primary-500/50 transition-colors shadow-inner">
        
        <!-- Input Area -->
        <div class="flex-1 min-w-0 flex flex-col justify-center min-h-[56px] relative bg-secondary-50/50 dark:bg-[#222222] rounded-xl overflow-hidden">
          
          <!-- Text Input -->
          <template v-if="!selectedFile">
            <textarea 
              v-model="newRagContent" 
              rows="2" 
              class="w-full h-full bg-transparent border-none pl-4 pr-12 py-3.5 text-secondary-900 dark:text-white placeholder-secondary-400 focus:ring-0 resize-none outline-none text-base transition-colors overflow-hidden flex-1"
              placeholder="Digite o conteúdo aqui ou cole um texto relevante..." 
              :disabled="isAddingRag || isAddingFile"
              @keydown.ctrl.enter="handleAddRag"
            ></textarea>
            
            <!-- Attachment Button (Text Mode) -->
            <button 
              type="button" 
              class="absolute top-1/2 -translate-y-1/2 right-2 p-2 text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 bg-white dark:bg-dark-surface shadow-sm rounded-lg border border-secondary-200/50 dark:border-dark-border transition-all hover:shadow-md active:scale-95 z-10"
              title="Anexar Arquivo"
              @click="fileInput?.click()"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
              </svg>
            </button>
          </template>

          <!-- File Preview -->
          <template v-else>
            <div class="flex items-center justify-between w-full h-full pl-3 pr-2 py-2">
              <div class="flex items-center gap-3 min-w-0">
                <div class="p-2.5 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-lg shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                </div>
                <div class="min-w-0">
                  <p class="text-sm font-semibold text-secondary-900 dark:text-white truncate">{{ selectedFile.name }}</p>
                  <p class="text-xs text-secondary-500 dark:text-secondary-400 mt-0.5">{{ (selectedFile.size / 1024 / 1024).toFixed(2) }} MB</p>
                </div>
              </div>
              
              <button 
                @click="clearSelectedFile" 
                type="button" 
                class="p-2 ml-3 text-secondary-400 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-500/10 rounded-full transition-colors shrink-0"
                title="Remover arquivo"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </template>

          <input 
            type="file" 
            ref="fileInput" 
            class="hidden" 
            accept=".pdf,.txt,.doc,.docx,.csv,.xlsx,.json,.jpg,.png"
            @change="handleFileSelect"
          >
        </div>

        <!-- Submit Button -->
        <div class="flex items-stretch shrink-0">
          <BaseButton 
            @click="handleAddRag" 
            :disabled="isSubmitDisabled()"
            class="w-full sm:w-auto h-full !text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 font-bold px-8 py-3.5 rounded-xl transition-all shadow-md shadow-primary-500/20 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95 border-none"
          >
            <span v-if="isAddingRag || isAddingFile" class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
            <template v-else>
              <span>Enviar</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
            </template>
          </BaseButton>
        </div>

      </div>
    </div>
  </div>
</template>
