import { serverSupabaseClient } from '#supabase/server'
import { IProduto } from '~/types/api.types'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)

    // 1. Validar sessão
    const { data: { user }, error: authError } = await client.auth.getUser()
    if (authError || !user?.id) {
        throw createError({ statusCode: 401, message: 'Não autenticado' })
    }

    // 2. Ler query params
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 30

    const from = (page - 1) * limit
    const to = from + limit - 1

    // 3. Consultar banco com paginação
    const { data, count, error } = await client
        .from('produtos')
        .select('IDPRODUTO, IDSUBPRODUTO, DESCRICAO, MODELO, EMBALAGEMSAIDA, VALPRECOVAREJO, QTDATUALESTOQUE', { count: 'exact' })
        .order('DESCRICAO', { ascending: true })
        .range(from, to)

    if (error) {
        console.error('Erro ao buscar produtos:', error)
        throw createError({ statusCode: 500, message: 'Erro ao listar produtos' })
    }

    // 4. Retornar resposta padronizada
    return {
        data: data as IProduto[],
        total: count || 0,
        page,
        limit
    }
})
