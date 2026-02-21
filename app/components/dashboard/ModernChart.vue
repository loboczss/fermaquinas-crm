<script setup lang="ts">
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  type ChartData,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler
)

interface Props {
  titulo: string
  chartData: ChartData<'line'>
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const stats = computed(() => {
  if (!props.chartData.datasets || props.chartData.datasets.length === 0) {
    return { total: 0, media: 0, pico: 0 }
  }

  const totals = props.chartData.labels?.map((_, index) => {
    return props.chartData.datasets.reduce((sum, dataset) => {
      const value = Array.isArray(dataset.data) ? (dataset.data[index] as number || 0) : 0
      return sum + value
    }, 0)
  }) || []

  const total = totals.reduce((sum, val) => sum + val, 0)
  const media = totals.length > 0 ? Math.round(total / totals.length) : 0
  const pico = Math.max(...totals, 0)

  return { total, media, pico }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index' as const,
    intersect: false,
  },
  elements: {
    line: {
      tension: 0.4, // Curvas suaves
      borderWidth: 2,
    },
    point: {
      radius: 0,
      hitRadius: 10,
      hoverRadius: 4,
    }
  },
  plugins: {
    legend: {
      display: false, // Escondemos a legenda padrão para um visual mais clean
    },
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      titleColor: '#111827',
      bodyColor: '#4B5563',
      padding: 12,
      cornerRadius: 8,
      borderColor: 'rgba(0, 0, 0, 0.05)',
      borderWidth: 1,
      displayColors: true,
      boxPadding: 4,
      usePointStyle: true,
      callbacks: {
        title: (context: any) => context[0].label,
        label: (context: any) => {
          let val = context.parsed.y
          // Se for a linha de faturamento (index 3), formata como moeda
          if (context.datasetIndex === 3) {
            val = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
            return ` ${context.dataset.label}: ${val}`
          }
          return ` ${context.dataset.label}: ${val}`
        },
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: {
        font: { size: 10, family: 'sans-serif' },
        color: '#9CA3AF',
        maxRotation: 0,
      },
      border: { display: false },
    },
    y: {
      type: 'linear' as const,
      display: true,
      position: 'left' as const,
      grid: {
        color: 'rgba(243, 244, 246, 0.7)', // gray-100 leve
        drawTicks: false,
      },
      ticks: {
        font: { size: 10, family: 'sans-serif' },
        color: '#9CA3AF',
        padding: 8,
        callback: (value: any) => {
          if (value >= 1000) {
            return (value / 1000).toFixed(1) + 'k'
          }
          return value
        }
      },
      border: { display: false, dash: [4, 4] },
    },
    y1: {
      type: 'linear' as const,
      display: true,
      position: 'right' as const,
      grid: { display: false },
      ticks: {
        font: { size: 10, family: 'sans-serif' },
        color: '#9CA3AF',
        padding: 8,
        callback: (value: any) => {
          if (value === 0) return '0'
          return new Intl.NumberFormat('pt-BR', { notation: 'compact', style: 'currency', currency: 'BRL' }).format(value)
        }
      },
      border: { display: false },
    },
  },
  animation: {
    duration: 1000,
    easing: 'easeOutQuart' as const,
  },
}))

// Adapta os dados de barras para linhas com gradiente/fill
const enhancedChartData = computed(() => {
  if (!props.chartData.datasets) return props.chartData

  return {
    ...props.chartData,
    datasets: props.chartData.datasets.map((dataset, index) => {
      const isFirst = index === 0
      return {
        ...dataset,
        type: 'line' as const,
        fill: true,
        // Colors corresponding to: 1-Novos, 2-Recorrentes, 3-Vendas(Qtd), 4-Faturamento
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx
          const gradient = ctx.createLinearGradient(0, 0, 0, 300)
          if (index === 0) {
            gradient.addColorStop(0, 'rgba(0, 220, 129, 0.25)') // primary-500
            gradient.addColorStop(1, 'rgba(0, 220, 129, 0)')
          } else if (index === 1) {
            gradient.addColorStop(0, 'rgba(245, 158, 11, 0.25)') // warning-500
            gradient.addColorStop(1, 'rgba(245, 158, 11, 0)')
          } else if (index === 2) {
            gradient.addColorStop(0, 'rgba(139, 92, 246, 0.25)') // violet-500
            gradient.addColorStop(1, 'rgba(139, 92, 246, 0)')
          } else {
            gradient.addColorStop(0, 'rgba(16, 185, 129, 0.25)') // emerald-500
            gradient.addColorStop(1, 'rgba(16, 185, 129, 0)')
          }
          return gradient
        },
        borderColor: index === 0 ? '#00DC81' : index === 1 ? '#F59E0B' : index === 2 ? '#8B5CF6' : '#10B981',
      }
    }),
  }
})
</script>

<template>
  <div class="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
    <div class="p-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ titulo }}
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Visão geral do volume de atendimentos
          </p>
        </div>
        
        <!-- Custom Legend -->
        <div v-if="!loading && chartData.labels && chartData.labels.length > 0" class="flex flex-wrap items-center gap-4 text-sm font-medium">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-primary-500"></span>
            <span class="text-gray-600 dark:text-gray-300">Novos</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-warning-500"></span>
            <span class="text-gray-600 dark:text-gray-300">Recorrentes</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-violet-500"></span>
            <span class="text-gray-600 dark:text-gray-300">Volume</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span class="text-gray-600 dark:text-gray-300">Faturamento</span>
          </div>
        </div>
      </div>
      
      <!-- Área do Gráfico -->
      <div class="relative h-72 w-full">
        <div v-if="loading" class="absolute inset-0 flex items-center justify-center">
          <div class="flex items-center gap-2 text-gray-400">
             <span class="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style="animation-delay: 0ms"></span>
             <span class="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style="animation-delay: 150ms"></span>
             <span class="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style="animation-delay: 300ms"></span>
          </div>
        </div>
        
        <Line 
          v-else-if="chartData.labels && chartData.labels.length > 0" 
          :data="enhancedChartData" 
          :options="chartOptions" 
        />
        
        <div v-else class="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
          <svg class="w-12 h-12 mb-3text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p class="text-sm font-medium">Nenhum dado no período</p>
        </div>
      </div>
    </div>
  </div>
</template>
