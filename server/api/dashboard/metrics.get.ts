import { serverSupabaseClient } from '#supabase/server'

/**
 * GET /api/dashboard/metrics
 *
 * Retorna métricas unificadas para o dashboard.
 * Query params: data_inicio, data_fim
 * RBAC: master vê métricas globais; vendedor vê apenas suas métricas.
 */
export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)

  const { data: { user }, error: sessionError } = await client.auth.getUser()
  if (sessionError || !user?.id) {
    throw createError({ statusCode: 401, message: 'Usuário não autenticado' })
  }

  const { data_inicio, data_fim } = getQuery(event) as { data_inicio?: string; data_fim?: string }

  if (!data_inicio || !data_fim) {
    throw createError({ statusCode: 400, message: 'data_inicio e data_fim são obrigatórios' })
  }

  // Buscar role do usuário
  const { data: profile } = await client
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isMaster = profile?.role === 'master'

  // 1. Buscar métricas da RPC (kpis + gráfico)
  const { data: rpcData, error: rpcError } = await client.rpc(
    'obter_dashboard_metricas',
    { data_inicio, data_fim },
  )

  if (rpcError) {
    throw createError({ statusCode: 500, message: rpcError.message })
  }

  const res = rpcData as any
  const kpis = res?.kpis || { total_clientes: 0, total_novos: 0, total_recorrentes: 0 }
  const grafico = res?.grafico || []

  // 2. Buscar vendas do período com RBAC
  let vendasQuery = client
    .from('historico_vendas_fermaquinas')
    .select('valor_venda, created_at')
    .gte('created_at', `${data_inicio}T00:00:00`)
    .lte('created_at', `${data_fim}T23:59:59`)
    .is('deleted_at', null)

  // RBAC: vendedor só vê suas próprias vendas
  if (!isMaster) {
    vendasQuery = vendasQuery.eq('vendedor_id', user.id)
  }

  const { data: vendasData, error: vendasError } = await vendasQuery

  if (vendasError) {
    console.error('[API dashboard/metrics] Erro vendas:', vendasError)
  }

  const vendasPeriodo = vendasData || []
  const valorTotalVendas = vendasPeriodo.reduce(
    (sum: number, v: any) => sum + (Number(v.valor_venda) || 0),
    0,
  )

  return {
    kpis,
    grafico,
    vendasPeriodo,
    valorTotalVendas,
  }
})
