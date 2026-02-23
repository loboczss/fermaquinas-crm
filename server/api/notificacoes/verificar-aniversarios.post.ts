import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)

    const { data: { user }, error: sessionError } = await client.auth.getUser()
    if (sessionError || !user?.id) {
        throw createError({ statusCode: 401, message: 'Usuário não autenticado' })
    }

    try {
        // 1. Chamar RPC para buscar os aniversariantes de hoje
        const { data: aniversariantes, error: aniversariantesError } = await client.rpc('aniversariantes_hoje')

        if (aniversariantesError) {
            console.error('[API notificacoes/aniversarios] Erro RPC:', aniversariantesError)
            throw createError({ statusCode: 500, message: aniversariantesError.message })
        }

        if (!aniversariantes || aniversariantes.length === 0) {
            return { success: true, count: 0, message: 'Nenhum aniversariante hoje' }
        }

        // 2. Buscar TODOS os usuários autenticados (masters e vendedores) que devem receber a notificação
        // Idealmente, a tabela profiles tem todos.
        const { data: usersParaNotificar, error: usersError } = await client
            .from('profiles')
            .select('user_id')

        if (usersError || !usersParaNotificar?.length) {
            throw createError({ statusCode: 500, message: 'Erro ao buscar usuários para notificar' })
        }

        // 3. Preparar e inserir notificações, evitando duplicatas.
        // Primeiro vamos buscar notificações de aniversario criadas HOJE para esses clientes
        // Para simplificar, faremos a inserção em lote, mas ignorando duplicações usando um identificador no DB, 
        // ou filtrando pelo created_at de hoje (gte start of day).

        // Pega as datas de hoje zero horas
        const todayStr = new Date().toISOString().split('T')[0] + 'T00:00:00.000Z'

        const { data: notificacoesHoje } = await client
            .from('notificacoes')
            .select('referencia_id, user_id')
            .eq('tipo', 'aniversario')
            .gte('created_at', todayStr)

        const notificacoesEmLote = []

        for (const aniv of aniversariantes) {
            for (const u of usersParaNotificar) {
                // Verifica se ESSA notificação específica já foi enviada HOJE para ESTE usuário
                const jaNotificado = notificacoesHoje?.some(
                    n => n.referencia_id === aniv.contato_id && n.user_id === u.user_id
                )

                if (!jaNotificado) {
                    notificacoesEmLote.push({
                        user_id: u.user_id,
                        tipo: 'aniversario',
                        titulo: `🎂 Aniversário de ${aniv.nome}`,
                        mensagem: `${aniv.nome} faz aniversário hoje! Aproveite para entrar em contato.`,
                        referencia_id: aniv.contato_id,
                    })
                }
            }
        }

        if (notificacoesEmLote.length > 0) {
            const { error: insertError } = await client.from('notificacoes').insert(notificacoesEmLote)
            if (insertError) {
                console.error('[API notificacoes/aniversarios] Erro Insert:', insertError)
                throw createError({ statusCode: 500, message: insertError.message })
            }
        }

        return { success: true, count: notificacoesEmLote.length }

    } catch (error: any) {
        if (error.statusCode) throw error
        console.error('[API notificacoes/aniversarios] Erro inesperado:', error)
        throw createError({ statusCode: 500, message: error.message })
    }
})
