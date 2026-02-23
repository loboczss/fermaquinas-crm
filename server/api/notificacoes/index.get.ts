import { serverSupabaseClient } from '#supabase/server'
import type { INotificacao } from '~/types/api.types'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)

    const { data: { user }, error: sessionError } = await client.auth.getUser()
    if (sessionError || !user?.id) {
        throw createError({ statusCode: 401, message: 'Usuário não autenticado' })
    }

    const { limit = '20', apenas_nao_lidas } = getQuery(event) as { limit?: string; apenas_nao_lidas?: string }
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20))

    // 1. Fetching Notifications
    let query = client
        .from('notificacoes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limitNum)

    if (apenas_nao_lidas === 'true') {
        query = query.eq('lida', false)
    }

    const { data: notificacoes, error } = await query

    if (error) {
        console.error('[API notificacoes/index] Erro ao buscar:', error)
        throw createError({ statusCode: 500, message: error.message })
    }

    // 2. Fetching unread count robustly
    const { count, error: countError } = await client
        .from('notificacoes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('lida', false)

    if (countError) {
        console.error('[API notificacoes/index] Erro ao contar não lidas:', countError)
    }

    return {
        data: notificacoes as INotificacao[] || [],
        total_nao_lidas: count || 0
    }
})
