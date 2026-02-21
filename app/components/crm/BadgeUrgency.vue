<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  urgencia: string | null
}>()

const urgenciaFormatada = computed(() => {
  if (!props.urgencia) return 'Não definida'
  const val = props.urgencia.toLowerCase()
  if (val.includes('baixa')) return 'Baixa'
  if (val.includes('alta')) return 'Alta'
  if (val.includes('media') || val.includes('média')) return 'Média'
  return props.urgencia
})

const badgeClass = computed(() => {
  const val = urgenciaFormatada.value.toLowerCase()
  if (val === 'alta') return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800'
  if (val === 'média' || val === 'media') return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
  if (val === 'baixa') return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800'
  return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700'
})
</script>

<template>
  <span 
    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
    :class="badgeClass"
  >
    {{ urgenciaFormatada }}
  </span>
</template>
