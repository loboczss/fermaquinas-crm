import { defineStore } from 'pinia'
import { format, subDays, eachDayOfInterval, parseISO } from 'date-fns'
import type { IDashboardMetrics, IContatoResumo, IMensagem, IMetricaRow, IVendaPeriodo } from '~/types/api.types'

// Re-exporta tipos para retrocompatibilidade
export type Mensagem = IMensagem
export type ContatoResumo = IContatoResumo
export type MetricaRow = IMetricaRow

// ─── Store ───────────────────────────────────────────────────
export const useChatDashboard = defineStore('chatDashboard', {
  state: () => ({
    filtroInicio: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    filtroFim: format(new Date(), 'yyyy-MM-dd'),
    valorTotalVendas: 0,
    vendasPeriodo: [] as IVendaPeriodo[],

    metricas: [] as IMetricaRow[],
    contatos: [] as IContatoResumo[],
    contatoSelecionado: null as string | null,
    mensagensAtuais: [] as IMensagem[],

    loadingMetricas: false,
    loadingContatos: false,
    loadingMensagens: false,
    error: null as string | null,
    kpisGlobais: {
      total_clientes: 0,
      total_novos: 0,
      total_recorrentes: 0
    },
  }),

  // ─── Getters ─────────────────────────────────────────────
  getters: {
    taxaNovos(state): number {
      const tc = state.kpisGlobais.total_clientes
      return tc > 0 ? (state.kpisGlobais.total_novos / tc) * 100 : 0
    },

    taxaRecorrentes(state): number {
      const tc = state.kpisGlobais.total_clientes
      return tc > 0 ? (state.kpisGlobais.total_recorrentes / tc) * 100 : 0
    },

    taxaConversaoVendas(state): number {
      const tc = state.kpisGlobais.total_clientes
      const vv = state.vendasPeriodo.length
      return tc > 0 ? (vv / tc) * 100 : 0
    },

    contatoAtual(state): ContatoResumo | undefined {
      return state.contatos.find(c => c.contato_id === state.contatoSelecionado)
    },

    totalVolumeVendas(state): number {
      return state.vendasPeriodo.length
    },

    chartData(state) {
      // Gera todos os dias entre filtroInicio e filtroFim
      const dateRange = eachDayOfInterval({
        start: parseISO(state.filtroInicio),
        end: parseISO(state.filtroFim),
      })

      // Cria um mapa dos dados existentes por data
      const metricasMap = new Map(
        state.metricas.map(m => [m.data_atendimento, m])
      )

      // Preenche todos os dias com dados (0 se não houver)
      const labels = dateRange.map(date => format(date, 'yyyy-MM-dd'))
      const novosData = labels.map(date => {
        const metrica = metricasMap.get(date)
        return metrica?.novos_clientes ?? 0
      })
      const recorrentesData = labels.map(date => {
        const metrica = metricasMap.get(date)
        return metrica?.clientes_recorrentes ?? 0
      })

      const vendasList = state.vendasPeriodo || []
      const vendasMap = new Map<string, { qtd: number; valor: number }>()

      for (const v of vendasList) {
        if (!v.created_at) continue
        const dateKey = v.created_at.substring(0, 10) // 'yyyy-MM-dd'
        const current = vendasMap.get(dateKey) || { qtd: 0, valor: 0 }
        current.qtd += 1
        current.valor += (Number(v.valor_venda) || 0)
        vendasMap.set(dateKey, current)
      }

      const faturamentoData = labels.map(date => {
        return Number(vendasMap.get(date)?.valor || 0)
      })
      const qtdVendasData = labels.map(date => {
        return Number(vendasMap.get(date)?.qtd || 0)
      })

      return {
        labels: labels.map(date => format(parseISO(date), 'dd/MM')), // Formatado para exibição
        datasets: [
          {
            label: 'Novos Clientes',
            backgroundColor: '#00DC81', // primary-500
            data: novosData,
            yAxisID: 'y',
          },
          {
            label: 'Clientes Recorrentes',
            backgroundColor: '#F59E0B', // warning-500
            data: recorrentesData,
            yAxisID: 'y',
          },
          {
            label: 'Volume de Vendas',
            backgroundColor: '#8B5CF6', // violet-500
            data: qtdVendasData,
            yAxisID: 'y',
          },
          {
            label: 'Faturamento Bruto',
            backgroundColor: '#10B981', // emerald-500
            data: faturamentoData,
            yAxisID: 'y1',
          },
        ],
      }
    },
  },

  // ─── Actions ─────────────────────────────────────────────
  actions: {
    async fetchMetricas() {
      this.loadingMetricas = true
      this.error = null

      try {
        const data = await $fetch<IDashboardMetrics>('/api/dashboard/metrics', {
          query: { data_inicio: this.filtroInicio, data_fim: this.filtroFim },
        })

        this.kpisGlobais = data.kpis || { total_clientes: 0, total_novos: 0, total_recorrentes: 0 }
        this.metricas = data.grafico || []
        this.vendasPeriodo = data.vendasPeriodo || []
        this.valorTotalVendas = data.valorTotalVendas || 0
      } catch (err: any) {
        this.error = err.data?.message || err.message || 'Erro ao buscar métricas'
        console.error('[chatDashboard] fetchMetricas:', err)
      } finally {
        this.loadingMetricas = false
      }
    },

    async fetchContatosUnicos() {
      this.loadingContatos = true
      this.error = null

      try {
        const data = await $fetch<IContatoResumo[]>('/api/dashboard/contatos', {
          query: { data_inicio: this.filtroInicio, data_fim: this.filtroFim },
        })

        this.contatos = data || []
      } catch (err: any) {
        this.error = err.data?.message || err.message || 'Erro ao buscar contatos'
        console.error('[chatDashboard] fetchContatosUnicos:', err)
      } finally {
        this.loadingContatos = false
      }
    },

    async selecionarContato(contato_id: string) {
      this.contatoSelecionado = contato_id
      this.loadingMensagens = true
      this.error = null

      try {
        const data = await $fetch<IMensagem[]>('/api/dashboard/mensagens', {
          query: { contato_id },
        })
        this.mensagensAtuais = data || []
      } catch (err: any) {
        this.error = err.data?.message || err.message || 'Erro ao buscar mensagens'
        console.error('[chatDashboard] selecionarContato:', err)
      } finally {
        this.loadingMensagens = false
      }
    },

    async aplicarFiltro() {
      await Promise.all([this.fetchMetricas(), this.fetchContatosUnicos()])
      this.contatoSelecionado = null
      this.mensagensAtuais = []
    },
  },
})
