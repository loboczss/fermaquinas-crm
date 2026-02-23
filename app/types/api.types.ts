// ─── Shared API Types ────────────────────────────────────────
// Tipagens compartilhadas entre server/ e app/ para garantir
// contratos rígidos de comunicação via $fetch.

/** Representa um cliente no CRM (tabela crm_fermaquinas) */
export interface ICliente {
  id: number
  created_at: string
  contato_id: string
  nome: string | null
  nome_social: string | null
  cidade: string | null
  email: string | null
  data_nascimento: string | null
  sentimento: string | null
  urgencia: string | null
  resumo_perfil: string | null
  interesses: string | null
  objeccoes: string | null
  fase_obra: string | null
  deleted_at: string | null
  deleted_by: string | null
}

/** Representa uma venda (tabela historico_vendas_fermaquinas) com join do cliente */
export interface IVenda {
  id: number
  created_at: string
  id_mensagem_venda: number | null
  contato_id: string
  valor_venda: number | null
  contact_name: string | null
  vendedor: string | null
  produtos: string | null
  deleted_at: string | null
  deleted_by: string | null
  vendedor_id: string | null
  cliente?: {
    nome: string | null
    nome_social: string | null
  } | null
}

/** Representa uma mensagem do histórico (tabela historico_msg_fermaquinas) */
export interface IMensagem {
  id: number
  created_at: string
  mensagem: string | null
  contato_id: string
  contact_name: string | null
  sender_type: string | null
  sender_name: string | null
}

/** KPIs retornados pela RPC obter_dashboard_metricas */
export interface IDashboardKpis {
  total_clientes: number
  total_novos: number
  total_recorrentes: number
}

/** Uma linha do gráfico de métricas */
export interface IMetricaRow {
  data_atendimento: string
  novos_clientes: number
  clientes_recorrentes: number
  total_clientes: number
}

/** Dados de vendas para o período (usados no gráfico do dashboard) */
export interface IVendaPeriodo {
  created_at: string
  valor_venda: number | null
}

/** Retorno unificado do endpoint /api/dashboard/metrics */
export interface IDashboardMetrics {
  kpis: IDashboardKpis
  grafico: IMetricaRow[]
  vendasPeriodo: IVendaPeriodo[]
  valorTotalVendas: number
}

/** Resumo de contato único (agrupado) */
export interface IContatoResumo {
  contato_id: string
  contact_name: string | null
  ultima_mensagem: string | null
  ultima_data: string
}

/** Resposta paginada genérica */
export interface IPaginatedResponse<T> {
  data: T[]
  total: number
  page: number
}

/** Roles disponíveis no sistema */
export type UserRole = 'master' | 'vendedor'

/** Retorno do endpoint /api/auth/role */
export interface IUserRoleResponse {
  role: UserRole
  userId: string
}

/** Representa um produto no catálogo (tabela produtos) */
export interface IProduto {
  IDPRODUTO: number | null
  IDSUBPRODUTO: number | null
  DESCRICAO: string | null
  MODELO: string | null
  EMBALAGEMSAIDA: string | null
  VALPRECOVAREJO: string | null
  QTDATUALESTOQUE: string | null
  VALTOTAL: string | null
}
