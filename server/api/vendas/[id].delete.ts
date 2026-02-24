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
    const query = getQuery(event)
    const devolver_estoque = String(query.devolver_estoque) === 'true' // Standardized to snake_case

    if (!id) {
        throw createError({ statusCode: 400, message: 'ID da venda é obrigatório' })
    }

    // 4. Se devolver_estoque for true, processar a devolução
    if (devolver_estoque) {
        try {
            // Buscar a venda para pegar os produtos
            const { data: venda, error: fetchError } = await serviceRole
                .from('historico_vendas_fermaquinas')
                .select('produtos_json')
                .eq('id', id)
                .single()

            if (fetchError) throw fetchError

            const produtosJson = venda.produtos_json
            if (produtosJson && Array.isArray(produtosJson)) {
                for (const item of produtosJson) {
                    if (!item.IDPRODUTO || !item.quantidade) continue

                    // 1. Buscar dados atuais do produto
                    const { data: produto } = await serviceRole
                        .from('produtos')
                        .select('"QTDATUALESTOQUE", "VALPRECOVAREJO"')
                        .eq('IDPRODUTO', String(item.IDPRODUTO))
                        .single()

                    if (produto) {
                        const estoqueAtual = parseInt(produto.QTDATUALESTOQUE || '0', 10)
                        const novoEstoque = estoqueAtual + item.quantidade

                        const precoStr = produto.VALPRECOVAREJO || '0'
                        const preco = parseFloat(precoStr.replace(',', '.')) || 0
                        const novoValTotal = preco * novoEstoque

                        await serviceRole
                            .from('produtos')
                            .update({
                                QTDATUALESTOQUE: String(novoEstoque),
                                VALTOTAL: String(novoValTotal)
                            })
                            .eq('IDPRODUTO', String(item.IDPRODUTO))
                    }
                }
            }
        } catch (error) {
            console.error('[API vendas/delete] Erro ao devolver estoque:', error)
            // Decidimos continuar com a exclusão mesmo se a devolução falhar? 
            // Melhor lançar erro para garantir integridade se o usuário pediu devolução.
            throw createError({ statusCode: 500, message: 'Erro ao processar devolução de estoque' })
        }
    }

    // 5. Delete real via serviceRole (bypass RLS)
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
