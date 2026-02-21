import { defineStore } from 'pinia'
import { format, subDays, eachDayOfInterval, parseISO } from 'date-fns'
import { useVendasStore } from '~/stores/useVendasStore'

// ─── Types ───────────────────────────────────────────────────
export interface Mensagem {
  id: number
  created_at: string
  mensagem: string | null
  contato_id: string
  contact_name: string | null
  sender_type: string | null
  sender_name: string | null
}

export interface ContatoResumo {
  contato_id: string
  contact_name: string | null
  ultima_mensagem: string | null
  ultima_data: string
}

export interface MetricaRow {
  data_atendimento: string
  novos_clientes: number
  clientes_recorrentes: number
  total_clientes: number
}

// ─── Store ───────────────────────────────────────────────────
export const useChatDashboard = defineStore('chatDashboard', {
  state: () => ({
    filtroInicio: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    filtroFim: format(new Date(), 'yyyy-MM-dd'),
    valorTotalVendas: 0,
    vendasPeriodo: [] as { created_at: string; valor_venda: number | null }[],

    metricas: [] as MetricaRow[],
    contatos: [] as ContatoResumo[],
    contatoSelecionado: null as string | null,
    mensagensAtuais: [] as Mensagem[],

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
      const client = useSupabaseClient()
      this.loadingMetricas = true
      this.error = null

      try {
        const { data, error } = await client.rpc(
          'obter_dashboard_metricas',
          { data_inicio: this.filtroInicio, data_fim: this.filtroFim },
        )
        if (error) throw error

        // O Supabase agora retorna um objeto com { kpis, grafico }
        if (data) {
          const res = data as any
          this.kpisGlobais = res.kpis || { total_clientes: 0, total_novos: 0, total_recorrentes: 0 }
          this.metricas = res.grafico || []
        } else {
          this.kpisGlobais = { total_clientes: 0, total_novos: 0, total_recorrentes: 0 }
          this.metricas = []
        }
      } catch (err: any) {
        this.error = err.message ?? 'Erro ao buscar métricas'
        console.error('[chatDashboard] fetchMetricas:', err)
      } finally {
        this.loadingMetricas = false
      }
    },

    async fetchContatosUnicos() {
      const client = useSupabaseClient()
      this.loadingContatos = true
      this.error = null

      try {
        // Busca todos os registros no período, depois agrupa no client
        const { data, error } = await client
          .from('historico_msg_fermaquinas')
          .select('contato_id, contact_name, mensagem, created_at')
          .gte('created_at', `${this.filtroInicio}T00:00:00`)
          .lte('created_at', `${this.filtroFim}T23:59:59`)
          .order('created_at', { ascending: false })

        if (error) throw error

        // Agrupa por contato_id e pega a última mensagem
        const map = new Map<string, ContatoResumo>()
        for (const row of data ?? []) {
          if (!map.has(row.contato_id)) {
            map.set(row.contato_id, {
              contato_id: row.contato_id,
              contact_name: row.contact_name,
              ultima_mensagem: row.mensagem,
              ultima_data: row.created_at,
            })
          }
        }

        this.contatos = Array.from(map.values())
      } catch (err: any) {
        this.error = err.message ?? 'Erro ao buscar contatos'
        console.error('[chatDashboard] fetchContatosUnicos:', err)
      } finally {
        this.loadingContatos = false
      }
    },

    async selecionarContato(contato_id: string) {
      const client = useSupabaseClient()
      this.contatoSelecionado = contato_id
      this.loadingMensagens = true
      this.error = null

      try {
        const { data, error } = await client
          .from('historico_msg_fermaquinas')
          .select('*')
          .eq('contato_id', contato_id)
          .order('created_at', { ascending: true })

        if (error) throw error
        this.mensagensAtuais = (data as Mensagem[]) ?? []
      } catch (err: any) {
        this.error = err.message ?? 'Erro ao buscar mensagens'
        console.error('[chatDashboard] selecionarContato:', err)
      } finally {
        this.loadingMensagens = false
      }
    },

    async fetchValorTotalVendas() {
      const client = useSupabaseClient()
      try {
        const { data, error } = await client
          .from('historico_vendas_fermaquinas')
          .select('valor_venda, created_at')
          .gte('created_at', `${this.filtroInicio}T00:00:00`)
          .lte('created_at', `${this.filtroFim}T23:59:59`)
          .is('deleted_at', null)

        if (error) throw error

        this.valorTotalVendas = data.reduce((sum, v) => sum + (Number(v.valor_venda) || 0), 0)
        this.vendasPeriodo = data || []
      } catch (err: any) {
        console.error('[chatDashboard] fetchValorTotalVendas:', err)
        this.valorTotalVendas = 0
        this.vendasPeriodo = []
      }
    },

    async aplicarFiltro() {
      await Promise.all([this.fetchMetricas(), this.fetchContatosUnicos(), this.fetchValorTotalVendas()])
      this.contatoSelecionado = null
      this.mensagensAtuais = []
    },
  },
})
