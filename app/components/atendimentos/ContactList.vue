<script setup lang="ts">
import { computed } from 'vue'
import type { ContatoResumo } from '~/stores/useChatDashboard'
import { format, parseISO, isToday, isYesterday } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Props {
  contatos: ContatoResumo[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<{
  (e: 'selectContato', contatoId: string): void
}>()

// Função para formatar a data/hora da última mensagem
const formatarData = (dateString?: string) => {
  if (!dateString) return ''
  try {
    const date = parseISO(dateString)
    if (isToday(date)) {
      return format(date, 'HH:mm')
    }
    if (isYesterday(date)) {
      return 'Ontem'
    }
    return format(date, 'dd/MM', { locale: ptBR })
  } catch {
    return ''
  }
}

const getInitials = (name: string | null): string => {
  if (!name?.trim()) return 'NA'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'NA'
  
  const first = parts[0]
  const last = parts[parts.length - 1]
  
  if (!first) return 'NA'
  if (parts.length === 1) return first.substring(0, 2).toUpperCase()
  if (!last || !first[0] || !last[0]) return 'NA'
  
  return (first[0] + last[0]).toUpperCase()
}
</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col h-full">
    
    <!-- Header da Lista -->
    <div class="px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Todos os Contatos
        </h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {{ loading ? 'Carregando...' : `${contatos.length} conversas encontradas` }}
        </p>
      </div>
      <!-- Espaço para um futuro input de busca (opcional) -->
      <div class="relative w-64 hidden sm:block">
         <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input type="text" placeholder="Buscar contato..." disabled class="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl leading-5 bg-white dark:bg-gray-800 text-gray-300 dark:text-gray-500 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500 sm:text-sm transition-colors cursor-not-allowed opacity-60">
      </div>
    </div>

    <!-- Lista de Contatos -->
    <div class="flex-1 overflow-y-auto">
      
      <!-- Loading State -->
      <div v-if="loading" class="p-6">
        <div v-for="i in 8" :key="i" class="flex items-center gap-4 mb-6 last:mb-0">
          <div class="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full animate-pulse flex-shrink-0" />
          <div class="flex-1 space-y-2">
            <div class="flex justify-between items-center">
              <div class="h-4 bg-gray-100 dark:bg-gray-700 rounded w-1/3 animate-pulse" />
              <div class="h-3 bg-gray-100 dark:bg-gray-700 rounded w-12 animate-pulse" />
            </div>
            <div class="h-3 bg-gray-100 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="contatos.length === 0" class="p-16 text-center flex flex-col items-center justify-center">
        <div class="w-16 h-16 bg-gray-50 dark:bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <p class="text-base font-semibold text-gray-700 dark:text-gray-300">Nenhum contato encontrado no período.</p>
        <p class="text-sm text-gray-500 mt-1">Ajuste os filtros de data no topo da página para ver resultados mais antigos.</p>
      </div>

      <!-- Table / Grid View -->
      <ul v-else class="divide-y divide-gray-100 dark:divide-gray-800/60">
        <li 
          v-for="contato in contatos" 
          :key="contato.contato_id"
          @click="emit('selectContato', contato.contato_id)"
          class="p-4 sm:px-6 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 cursor-pointer transition-all duration-200 group relative"
        >
          <!-- Indicador de hover lateral (Design Touch) -->
          <div class="absolute left-0 top-0 bottom-0 w-1 bg-primary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-r-full"></div>

          <div class="flex items-center gap-4">
            <!-- Avatar -->
            <div class="w-12 h-12 rounded-full bg-gradient-to-tr from-primary-50 to-indigo-50 dark:from-primary-900/40 dark:to-indigo-900/40 flex items-center justify-center text-primary-600 dark:text-primary-400 text-sm font-bold flex-shrink-0 shadow-sm border border-primary-100/50 dark:border-primary-800/30 group-hover:scale-105 transition-transform duration-300">
              {{ getInitials(contato.contact_name) }}
            </div>
            
            <!-- Info principal -->
            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-center mb-1">
                <p class="text-base font-medium text-gray-900 dark:text-gray-100 truncate pr-4 group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
                  {{ contato.contact_name || 'Nome não disponível' }}
                </p>
                <span class="text-xs font-medium text-gray-400 dark:text-gray-500 whitespace-nowrap">
                  {{ formatarData(contato.ultima_data) }}
                </span>
              </div>
              <div class="flex items-center gap-2">
                <p class="text-sm text-gray-500 dark:text-gray-400 truncate flex-1">
                  {{ contato.ultima_mensagem || 'Nenhuma mensagem recente' }}
                </p>
                <!-- Badge Ativo (Status mockado para design) -->
                <span class="w-2 h-2 rounded-full bg-green-500 ring-4 ring-green-50 dark:ring-green-900/20 flex-shrink-0" title="Ativo"></span>
              </div>
            </div>
          </div>
        </li>
      </ul>

    </div>
  </div>
</template>
