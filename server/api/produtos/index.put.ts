import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'

/**
 * PUT /api/produtos
 * 
 * Atualiza um produto existente.
 * Apenas usuários com role 'master' podem executar.
 */
export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)
    const serviceRole = serverSupabaseServiceRole(event)

    // 1. Validar sessão
    const { data: { user }, error: authError } = await client.auth.getUser()
    if (authError || !user?.id) {
        throw createError({ statusCode: 401, message: 'Não autenticado' })
    }

    // 2. Verificar role master via serviceRole
    const { data: profile } = await serviceRole
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single()

    if (profile?.role !== 'master') {
        throw createError({ statusCode: 403, message: 'Apenas master pode editar produtos' })
    }

    // 3. Ler corpo da requisição
    const body = await readBody(event)
    const idProduto = body.IDPRODUTO

    if (!idProduto) {
        throw createError({ statusCode: 400, message: 'ID do produto é necessário para atualização' })
    }

    // 4. Sanitizar e preparar dados
    const updateData = {
        DESCRICAO: body.DESCRICAO,
        MODELO: body.MODELO,
        EMBALAGEMSAIDA: body.EMBALAGEMSAIDA,
        VALPRECOVAREJO: body.VALPRECOVAREJO != null ? String(body.VALPRECOVAREJO) : null,
        QTDATUALESTOQUE: body.QTDATUALESTOQUE != null ? String(body.QTDATUALESTOQUE) : null,
        IDSUBPRODUTO: body.IDSUBPRODUTO
    }

    // 5. Atualizar via serviceRole (bypass RLS)
    const { data, error } = await serviceRole
        .from('produtos')
        .update(updateData)
        .eq('IDPRODUTO', idProduto)
        .select()
        .single()

    if (error) {
        console.error('Erro ao atualizar produto:', error)
        throw createError({ statusCode: 500, message: 'Erro ao atualizar o produto no banco de dados' })
    }

    return { success: true, data }
})
