<script setup lang="ts">
import { ref, onMounted } from 'vue'
import BaseButton from '~/components/BaseButton.vue'
import { useAgenteStore } from '~/stores/agenteStore'
import { storeToRefs } from 'pinia'
import { VueMonacoEditor } from '@guolao/vue-monaco-editor'

const agenteStore = useAgenteStore()
const { systemPrompt, isLoadingPrompt, isSavingPrompt } = storeToRefs(agenteStore)

const promptInput = ref('')

onMounted(async () => {
  if (!systemPrompt.value) {
    await agenteStore.fetchSystemPrompt()
  }
  promptInput.value = systemPrompt.value?.prompt || ''
})

const savePrompt = async () => {
  await agenteStore.updateSystemPrompt(promptInput.value)
}

const MONACO_EDITOR_OPTIONS = {
  automaticLayout: true,
  formatOnType: true,
  formatOnPaste: true,
  wordWrap: 'on',
  minimap: { enabled: false },
  fontSize: 14,
  lineHeight: 24,
  fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, 'Courier New', monospace",
  scrollBeyondLastLine: false,
  smoothScrolling: true,
  cursorBlinking: 'smooth',
  cursorSmoothCaretAnimation: 'on',
  renderLineHighlight: 'all',
}
</script>

<template>
  <section class="space-y-6 animate-fade-in relative">
    <div class="flex flex-col gap-2">
      <label class="text-xl font-extrabold text-secondary-900 dark:text-white flex items-center gap-2" for="prompt">
        <svg class="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        System Prompt
      </label>
      <p class="text-base text-secondary-500 dark:text-secondary-400 max-w-3xl">
        Utilize a formatação <strong>Markdown</strong> para definir regras claras e estruturadas para o agente inteligência artificial.
      </p>
    </div>
    
    <div class="relative group mt-4">
      <!-- Editor wrapper with Glassmorphism ring -->
      <div class="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
      
      <div class="relative bg-white dark:bg-[#1e1e1e] rounded-xl overflow-hidden border border-secondary-200 dark:border-dark-border shadow-inner min-h-[450px]">
        <!-- Loading Overlay -->
        <div v-if="isLoadingPrompt" class="absolute inset-0 z-20 bg-white/70 dark:bg-dark-surface/70 flex items-center justify-center backdrop-blur-sm">
           <div class="flex flex-col items-center gap-4">
             <span class="animate-spin h-10 w-10 border-4 border-primary-500 border-t-transparent rounded-full shadow-lg"></span>
             <p class="text-sm font-semibold text-secondary-600 dark:text-secondary-300 animate-pulse">Carregando prompt...</p>
           </div>
        </div>

        <!-- Editor Toolbar Header -->
        <div class="h-10 border-b border-secondary-200 dark:border-dark-border bg-secondary-50 dark:bg-[#252526] flex items-center px-4 gap-2 text-xs font-mono text-secondary-500 dark:text-secondary-400">
          <div class="flex gap-1.5 mr-2">
            <div class="w-3 h-3 rounded-full bg-red-400/80"></div>
            <div class="w-3 h-3 rounded-full bg-yellow-400/80"></div>
            <div class="w-3 h-3 rounded-full bg-green-400/80"></div>
          </div>
          <span class="opacity-75">system_prompt.md</span>
        </div>
        
        <!-- Monaco Editor -->
        <ClientOnly>
          <template #fallback>
            <div class="h-[410px] w-full flex items-center justify-center p-6 bg-white dark:bg-[#1e1e1e]">
              <div class="animate-pulse flex flex-col gap-4 w-full">
                <div class="h-4 bg-secondary-200 dark:bg-secondary-800 rounded w-3/4"></div>
                <div class="h-4 bg-secondary-200 dark:bg-secondary-800 rounded w-1/2"></div>
                <div class="h-4 bg-secondary-200 dark:bg-secondary-800 rounded w-5/6"></div>
                <div class="h-4 bg-secondary-200 dark:bg-secondary-800 rounded w-2/3"></div>
              </div>
            </div>
          </template>
          
          <div class="h-[410px] w-full relative">
            <VueMonacoEditor
              v-model:value="promptInput"
              theme="vs-dark"
              language="markdown"
              :options="MONACO_EDITOR_OPTIONS"
              class="w-full h-full"
            />
          </div>
        </ClientOnly>
      </div>
    </div>
    
    <!-- Action Button -->
    <div class="flex justify-end pt-4">
      <BaseButton 
        @click="savePrompt"
        :disabled="isSavingPrompt || isLoadingPrompt"
        class="!text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 font-bold px-8 py-3 rounded-xl shadow-lg shadow-primary-500/25 flex items-center gap-3 transition-all active:scale-95"
      >
        <span v-if="isSavingPrompt" class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
        <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
        {{ isSavingPrompt ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES' }}
      </BaseButton>
    </div>
  </section>
</template>
