<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAgenteStore } from '~/stores/agenteStore'
import AgenteRagInput from './AgenteRagInput.vue'

const agenteStore = useAgenteStore()
const { ragList, isLoadingRag } = storeToRefs(agenteStore)

onMounted(async () => {
  await agenteStore.fetchRagList()
})

const formatDate = (dateString?: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('pt-BR')
}
</script>

<template>
  <div class="space-y-10">
    <!-- Input Component -->
    <AgenteRagInput />

    <!-- Loading State -->
    <div v-if="isLoadingRag" class="flex justify-center py-8">
       <span class="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full"></span>
    </div>

    <!-- Empty State -->
    <div v-else-if="ragList.length === 0" class="text-center py-12 px-4 rounded-2xl border border-dashed border-secondary-200 dark:border-dark-border bg-secondary-50/50 dark:bg-dark-surface/30">
      <div class="inline-flex items-center justify-center p-4 bg-white dark:bg-secondary-800 rounded-full shadow-sm border border-secondary-100 dark:border-dark-border mb-4">
        <svg class="w-8 h-8 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
      </div>
      <h4 class="text-base font-medium text-secondary-900 dark:text-white mb-1">Nenhum conhecimento adicionado</h4>
      <p class="text-sm text-secondary-500 dark:text-secondary-400 max-w-sm mx-auto">Sua base de RAG está vazia. Adicione textos ou arquivos para que o agente possa utilizá-los como contexto.</p>
    </div>

    <!-- List -->
    <div v-else class="grid gap-4 mt-8">
      <h3 class="text-lg font-bold text-secondary-900 dark:text-white">Conhecimentos da Base</h3>
      <div 
        v-for="item in ragList" 
        :key="item.id"
        class="group flex items-center justify-between p-5 rounded-2xl border border-secondary-200 dark:border-dark-border bg-white dark:bg-dark-surface/80 hover:shadow-md hover:border-primary-200 dark:hover:border-primary-500/30 transition-all duration-300"
      >
        <div class="flex items-start gap-4 flex-1 min-w-0">
          <div class="p-2.5 bg-secondary-50 dark:bg-secondary-800/50 rounded-xl text-secondary-500 dark:text-secondary-400 shrink-0 border border-secondary-100 dark:border-dark-border/50">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
          </div>
          <div class="flex-1 min-w-0 pr-4">
            <p class="font-semibold text-secondary-900 dark:text-white text-sm line-clamp-2" :title="item.content || ''">{{ item.content }}</p>
            <p class="text-xs text-secondary-500 dark:text-secondary-400 mt-1.5 flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Adicionado em {{ formatDate(item.created_at) }}
            </p>
          </div>
        </div>
        <div class="shrink-0 flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button 
             @click="agenteStore.deleteRagContent(item.id)" 
             class="p-2.5 text-secondary-400 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-500/10 rounded-xl transition-all border border-transparent hover:border-danger-100 dark:hover:border-danger-500/20"
             title="Excluir informação"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
