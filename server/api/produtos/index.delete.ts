import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)
    const serviceRole = serverSupabaseServiceRole(event)

    // 1. Validar sessão
    const { data: { user }, error: authError } = await client.auth.getUser()
    if (authError || !user?.id) {
        throw createError({ statusCode: 401, message: 'Não autenticado' })
    }

    // 2. Verificar role master (via serviceRole para evitar problemas de RLS)
    const { data: profile } = await serviceRole
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single()

    if (profile?.role !== 'master') {
        throw createError({ statusCode: 403, message: 'Apenas master pode excluir produtos' })
    }

    // 3. Ler ID do produto da query
    const query = getQuery(event)
    const idProduto = query.id

    if (!idProduto) {
        throw createError({ statusCode: 400, message: 'ID do produto não informado' })
    }

    // 4. Excluir produto via serviceRole (bypass RLS)
    const { error } = await serviceRole
        .from('produtos')
        .delete()
        .eq('IDPRODUTO', idProduto)

    if (error) {
        console.error('Erro ao excluir produto:', error)
        throw createError({ statusCode: 500, message: 'Erro ao excluir o produto no banco de dados' })
    }

    return { success: true }
})

