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
    const searchQuery = (query.q as string) || ''
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 10

    const from = (page - 1) * limit
    const to = from + limit - 1

    // 3. Consultar banco com paginação
    let dbQuery = client
        .from('produtos')
        .select('IDPRODUTO, IDSUBPRODUTO, DESCRICAO, MODELO, EMBALAGEMSAIDA, VALPRECOVAREJO, QTDATUALESTOQUE', { count: 'exact' })

    if (searchQuery) {
        // Busca por descrição, modelo ou IDs se for numérico
        const isNumeric = /^\d+$/.test(searchQuery)
        if (isNumeric) {
            dbQuery = dbQuery.or(`IDPRODUTO.eq.${searchQuery},IDSUBPRODUTO.eq.${searchQuery},DESCRICAO.ilike.%${searchQuery}%,MODELO.ilike.%${searchQuery}%`)
        } else {
            dbQuery = dbQuery.or(`DESCRICAO.ilike.%${searchQuery}%,MODELO.ilike.%${searchQuery}%`)
        }
    }

    const { data, count, error } = await dbQuery
        .order('DESCRICAO', { ascending: true })
        .range(from, to)

    if (error) {
        console.error('Erro na busca de produtos:', error)
        throw createError({ statusCode: 500, message: 'Erro ao buscar produtos' })
    }

    // 4. Retornar resposta padronizada
    return {
        data: data as IProduto[],
        total: count || 0,
        page,
        limit
    }
})
