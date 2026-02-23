import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'

/**
 * DELETE /api/vendas/:id
 *
 * Exclui uma venda. Apenas usuários com role 'master' podem executar.
 * Usa serviceRole para o delete real para evitar problemas de RLS.
 */
export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)
    const serviceRole = serverSupabaseServiceRole(event)

    // 1. Validar sessão
    const { data: { user }, error } = await client.auth.getUser()
    if (error || !user?.id) {
        throw createError({ statusCode: 401, message: 'Não autenticado' })
    }

    // 2. Verificar role master (via serviceRole para evitar RLS)
    const { data: profile } = await serviceRole
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single()

    if (profile?.role !== 'master') {
        throw createError({ statusCode: 403, message: 'Apenas administradores podem excluir vendas' })
    }

    // 3. Pegar ID da venda
    const id = getRouterParam(event, 'id')
    if (!id) {
        throw createError({ statusCode: 400, message: 'ID da venda é obrigatório' })
    }

    // 4. Delete real via serviceRole (bypass RLS)
    const { error: deleteError } = await serviceRole
        .from('historico_vendas_fermaquinas')
        .delete()
        .eq('id', id)

    if (deleteError) {
        console.error('[API vendas/delete] Erro:', deleteError)
        throw createError({ statusCode: 500, message: 'Erro ao excluir venda' })
    }

    return { success: true, message: 'Venda excluída com sucesso' }
})
