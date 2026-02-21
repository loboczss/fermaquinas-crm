<script setup lang="ts">
interface Contato {
  contato_id: string
  contact_name: string | null
  ultima_mensagem?: string | null
  horario_ultima_msg?: string
}

interface Props {
  contatos: Contato[]
  loading?: boolean
  maxItems?: number
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  maxItems: 10,
})

const emit = defineEmits<{
  'select-contato': [contatoId: string]
}>()

const contatosLimitados = computed(() => props.contatos.slice(0, props.maxItems))

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
  <div class="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
    <div class="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
      <div>
        <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100">
          Últimos Contatos Recentes
        </h3>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Histórico de interações da plataforma
        </p>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto max-h-[400px]">
      <div v-if="loading" class="p-6">
        <div v-for="i in 5" :key="i" class="flex items-center gap-4 mb-5 last:mb-0">
          <div class="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full animate-pulse flex-shrink-0" />
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-gray-100 dark:bg-gray-700 rounded w-1/3 animate-pulse" />
            <div class="h-3 bg-gray-100 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
          </div>
        </div>
      </div>

      <div v-else-if="contatos.length === 0" class="p-10 text-center flex flex-col items-center justify-center h-full">
        <svg class="w-10 h-10 text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <p class="text-sm font-medium text-gray-500">Nenhum contato encontrado no período.</p>
      </div>

      <ul v-else class="divide-y divide-gray-100 dark:divide-gray-800">
        <li 
          v-for="contato in contatosLimitados" 
          :key="contato.contato_id"
          class="p-4 hover:bg-gray-50/80 dark:hover:bg-gray-700/20 transition-colors group cursor-pointer"
          @click="emit('select-contato', contato.contato_id)"
        >
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 text-sm font-semibold flex-shrink-0">
              {{ getInitials(contato.contact_name) }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-baseline mb-0.5">
                <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate pr-2">
                  {{ contato.contact_name || 'Nome não disponível' }}
                </p>
                <span class="text-[10px] text-gray-400 whitespace-nowrap">#{{ contato.contato_id }}</span>
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                {{ contato.ultima_mensagem || 'Sem mensagens' }}
              </p>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
