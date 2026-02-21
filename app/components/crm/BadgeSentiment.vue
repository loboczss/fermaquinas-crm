<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  sentimento: string | null
}>()

const sentimentoFormatado = computed(() => {
  if (!props.sentimento) return 'Não definido'
  const val = props.sentimento.toLowerCase()
  if (val.includes('positivo')) return 'Positivo'
  if (val.includes('neutro')) return 'Neutro'
  if (val.includes('negativo')) return 'Negativo'
  if (val.includes('urgente')) return 'Urgente'
  return props.sentimento
})

const badgeClass = computed(() => {
  const val = sentimentoFormatado.value.toLowerCase()
  if (val === 'positivo') return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800'
  if (val === 'neutro') return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700'
  if (val === 'negativo') return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800'
  if (val === 'urgente') return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800'
  return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700'
})
</script>

<template>
  <span 
    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
    :class="badgeClass"
  >
    <!-- Opcional: ícone dependendo do sentimento -->
    <svg v-if="sentimentoFormatado === 'Positivo'" class="-ml-0.5 mr-1.5 h-3 w-3 text-green-500" fill="currentColor" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3" /></svg>
    <svg v-else-if="sentimentoFormatado === 'Negativo'" class="-ml-0.5 mr-1.5 h-3 w-3 text-red-500" fill="currentColor" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3" /></svg>
    <svg v-else-if="sentimentoFormatado === 'Neutro'" class="-ml-0.5 mr-1.5 h-3 w-3 text-gray-500" fill="currentColor" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3" /></svg>
    <svg v-else-if="sentimentoFormatado === 'Urgente'" class="-ml-0.5 mr-1.5 h-3 w-3 text-orange-500" fill="currentColor" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3" /></svg>
    {{ sentimentoFormatado }}
  </span>
</template>
