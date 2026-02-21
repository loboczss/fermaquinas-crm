<script setup lang="ts">
import { computed, watch, ref } from 'vue'

interface Props {
  titulo: string
  valor: number | string
  cor?: 'blue' | 'green' | 'gray' | 'violet'
  loading?: boolean
  tipo?: 'numero' | 'moeda'
  badgeText?: string
  badgeColor?: 'green' | 'gray'
}

const props = withDefaults(defineProps<Props>(), {
  cor: 'gray',
  loading: false,
  tipo: 'numero',
  badgeColor: 'gray',
})

const iconColorClass = computed(() => {
  switch (props.cor) {
    case 'blue': return 'text-blue-600 dark:text-blue-400 bg-blue-50 border-blue-100 dark:bg-blue-500/10 dark:border-blue-500/20'
    case 'green': return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20'
    case 'violet': return 'text-violet-600 dark:text-violet-400 bg-violet-50 border-violet-100 dark:bg-violet-500/10 dark:border-violet-500/20'
    default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 border-gray-100 dark:bg-gray-800 dark:border-gray-700'
  }
})

const bgGradientClass = computed(() => {
  switch (props.cor) {
    case 'blue': return 'from-blue-200 to-transparent dark:from-blue-600/30'
    case 'green': return 'from-emerald-200 to-transparent dark:from-emerald-600/30'
    case 'violet': return 'from-violet-200 to-transparent dark:from-violet-600/30'
    default: return 'from-gray-200 to-transparent dark:from-gray-600/30'
  }
})

const displayValue = ref(0)
const targetValue = computed(() => {
  const val = typeof props.valor === 'string' ? parseFloat(props.valor) : props.valor
  return isNaN(val) ? 0 : val
})

const animateValue = () => {
  if (typeof window === 'undefined') {
    displayValue.value = targetValue.value
    return
  }

  const start = displayValue.value
  const end = targetValue.value
  const duration = 1000
  const startTime = Date.now()

  const animate = () => {
    const currentTime = Date.now()
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const easeProgress = 1 - Math.pow(1 - progress, 4)
    displayValue.value = Math.round(start + (end - start) * easeProgress)
    
    if (progress < 1) requestAnimationFrame(animate)
  }
  
  animate()
}

const formatadorValor = (val: number) => {
  if (props.tipo === 'moeda') {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  }
  return val.toLocaleString('pt-BR')
}

watch([() => props.valor, () => props.loading], () => {
  if (!props.loading) {
    animateValue()
  }
}, { immediate: true })
</script>

<template>
  <div 
    class="relative overflow-hidden bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all duration-300 group ring-1 ring-inset ring-transparent hover:ring-gray-200 dark:hover:ring-gray-700 isolate flex flex-col justify-between"
  >
    <!-- Background Gradient Effect -->
    <div 
      class="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-gradient-to-br opacity-50 dark:opacity-30 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700 pointer-events-none -z-10"
      :class="bgGradientClass"
    />

    <div class="flex items-start justify-between mb-6">
      <!-- Icon Container -->
      <div 
        class="flex items-center justify-center w-11 h-11 rounded-xl border group-hover:-translate-y-1 transition-transform duration-300 shadow-sm"
        :class="iconColorClass"
      >
        <svg v-if="cor === 'blue'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
        <svg v-else-if="cor === 'green'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <svg v-else-if="cor === 'violet'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      </div>
      
      <!-- Badge -->
      <div v-if="badgeText && !loading">
         <span :class="[
          'inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest',
          badgeColor === 'green' 
            ? 'text-emerald-700 bg-emerald-100/50 dark:bg-emerald-500/10 dark:text-emerald-400' 
            : 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400'
        ]">
          {{ badgeText }}
        </span>
      </div>
    </div>

    <!-- Title & Value -->
    <div class="mt-auto">
      <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 lg:mb-2 truncate">
        {{ titulo }}
      </h3>
      
      <div v-if="!loading">
        <p class="text-2xl sm:text-[1.75rem] font-extrabold text-gray-900 dark:text-white tracking-tight tabular-nums leading-none">
          {{ formatadorValor(displayValue) }}
        </p>
      </div>
      <div v-else class="h-8 w-2/3 bg-gray-100 dark:bg-gray-800 rounded-md animate-pulse" />
    </div>
  </div>
</template>
