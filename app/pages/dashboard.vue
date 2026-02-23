<script setup lang="ts">
import { useChatDashboard } from '~/stores/useChatDashboard'
import { format, subDays } from 'date-fns'
import KpiCard from '~/components/dashboard/KpiCard.vue'
import ModernChart from '~/components/dashboard/ModernChart.vue'
import ContactsTable from '~/components/dashboard/ContactsTable.vue'
import ChatModal from '~/components/atendimentos/ChatModal.vue'

const store = useChatDashboard()
const isModalOpen = ref(false)

// Carrega dados iniciais ao montar o componente
onMounted(() => {
  const savedInicio = localStorage.getItem('dash_filtro_inicio')
  const savedFim = localStorage.getItem('dash_filtro_fim')
  
  if (savedInicio) {
    store.filtroInicio = savedInicio
  } else {
    // Fallback para data local se não houver salvo
    const now = new Date()
    store.filtroInicio = format(subDays(now, 7), 'yyyy-MM-dd')
  }

  if (savedFim) {
    store.filtroFim = savedFim
  } else {
    // Fallback para data local se não houver salvo
    const now = new Date()
    store.filtroFim = format(now, 'yyyy-MM-dd')
  }

  store.aplicarFiltro()
})

const applyDateFilter = () => {
  localStorage.setItem('dash_filtro_inicio', store.filtroInicio)
  localStorage.setItem('dash_filtro_fim', store.filtroFim)
  store.aplicarFiltro()
}

// Removido computed faturamentoTotal porque o KpiCard cuidará da formatação internamente

const handleSelectContato = async (contatoId: string) => {
  isModalOpen.value = true
  await store.selecionarContato(contatoId)
}

const handleCloseModal = () => {
  isModalOpen.value = false
  store.contatoSelecionado = null
  store.mensagensAtuais = []
}
</script>

<template>
  <main class="min-h-[calc(100vh-3.5rem)] bg-gray-50/50 dark:bg-gray-900 transition-colors">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <!-- Cabeçalho da Página com Filtros -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-gray-200/50 dark:border-gray-800 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div>
          <h1 class="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">
            Overview
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Acompanhe o desempenho dos atendimentos
          </p>
        </div>
        
        <!-- Filtros de Data -->
        <div class="flex flex-col sm:flex-row flex-wrap items-start sm:items-end gap-3 z-10 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 w-full md:w-auto">
          <div class="w-full sm:w-auto">
            <label class="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
              Data Inicial
            </label>
            <input
              v-model="store.filtroInicio"
              type="date"
              @change="applyDateFilter"
              class="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-sm rounded-xl px-3 py-2 text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
            />
          </div>
          
          <div class="w-full sm:w-auto">
            <label class="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
              Data Final
            </label>
            <input
              v-model="store.filtroFim"
              type="date"
              @change="applyDateFilter"
              class="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-sm rounded-xl px-3 py-2 text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
            />
          </div>
        </div>
      </div>

      <!-- Linha 1: KPI Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <KpiCard
          titulo="Faturamento Bruto"
          :valor="store.valorTotalVendas"
          cor="green"
          tipo="moeda"
          :loading="store.loadingMetricas"
        />
        <KpiCard
          titulo="Volume de Vendas"
          :valor="store.totalVolumeVendas"
          cor="violet"
          :loading="store.loadingMetricas"
          :badge-text="`${store.taxaConversaoVendas.toFixed(1)}% de conversão`"
          badge-color="gray"
        />
        <KpiCard
          titulo="Total de Clientes"
          :valor="store.kpisGlobais.total_clientes"
          cor="gray"
          :loading="store.loadingMetricas"
        />
        <KpiCard
          titulo="Novos Clientes"
          :valor="store.kpisGlobais.total_novos"
          cor="blue"
          :loading="store.loadingMetricas"
          :badge-text="`${store.taxaNovos.toFixed(1)}% do total`"
          badge-color="gray"
        />
        <KpiCard
          titulo="Clientes Recorrentes"
          :valor="store.kpisGlobais.total_recorrentes"
          cor="green"
          :loading="store.loadingMetricas"
          :badge-text="`${store.taxaRecorrentes.toFixed(1)}% de retenção`"
          badge-color="gray"
        />
      </div>

      <!-- Linha 2: Dashboard Principal Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-6 duration-1000">
        
        <!-- Coluna Esquerda: Gráfico (Ocupa 2/3) -->
        <div class="lg:col-span-2 flex flex-col gap-6">
          <ModernChart
            titulo="Evolução de Atendimentos"
            :chart-data="store.chartData"
            :loading="store.loadingMetricas"
          />
        </div>

        <!-- Coluna Direita: Contatos Recentes (Ocupa 1/3) -->
        <div class="lg:col-span-1 flex flex-col gap-6">
          <div class="flex-1">
            <ContactsTable
              :contatos="store.contatos"
              :loading="store.loadingContatos"
              :max-items="12"
              @select-contato="handleSelectContato"
            />
          </div>
        </div>

      </div>

    </div>
    
    <!-- Modal do Chat -->
    <ChatModal 
      :is-open="isModalOpen"
      :contato="store.contatoAtual"
      :mensagens="store.mensagensAtuais"
      :loading="store.loadingMensagens"
      @close="handleCloseModal"
    />
  </main>
</template>
