import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)

    const { data: { user }, error: sessionError } = await client.auth.getUser()
    if (sessionError || !user?.id) {
        throw createError({ statusCode: 401, message: 'Usuário não autenticado' })
    }

    const body = await readBody(event)
    const idList = body?.ids as number[] | undefined
    const markAll = body?.todas as boolean | undefined

    if (!idList && !markAll) {
        throw createError({ statusCode: 400, message: 'Forneça "ids" ou "todas: true"' })
    }

    try {
        let query = client
            .from('notificacoes')
            .update({ lida: true })
            .eq('user_id', user.id)
            .eq('lida', false)

        if (markAll) {
            // Atualiza todas do usuário que não estão lidas
            const { error } = await query
            if (error) throw error
        } else if (idList && idList.length > 0) {
            // Atualiza apenas os IDs informados
            const { error } = await query.in('id', idList)
            if (error) throw error
        }

        return { success: true }
    } catch (error: any) {
        console.error('[API notificacoes/ler] Erro:', error)
        throw createError({ statusCode: 500, message: error.message || 'Erro ao marcar notificações como lidas' })
    }
})
