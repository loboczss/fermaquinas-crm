import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
    try {
        const authClient = await serverSupabaseClient(event)
        const { data: { user }, error: sessionError } = await authClient.auth.getUser()

        if (sessionError || !user || !user.id) {
            throw createError({
                statusCode: 401,
                statusMessage: 'Unauthorized',
                message: 'Usuário não autenticado'
            })
        }

        const workspaceId = getRouterParam(event, 'id')
        if (!workspaceId) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Bad Request',
                message: 'ID do workspace é obrigatório'
            })
        }

        // Usar Service Role para bypass RLS e forçar update
        const serviceRoleClient = serverSupabaseServiceRole(event)

        const { error: updateError } = await serviceRoleClient
            .from('workspaces')
            .update({
                deleted_at: new Date().toISOString(),
                deleted_by: user.id
            })
            .eq('id', workspaceId)
            .eq('user_id', user.id)

        if (updateError) {
            console.error('[API Workspaces DELETE] Erro ao deletar:', updateError)
            throw updateError
        }

        return { success: true, message: 'Workspace deletado com sucesso' }
    } catch (error: any) {
        if (error.statusCode) throw error

        throw createError({
            statusCode: 500,
            statusMessage: 'Internal Server Error',
            message: error.message || 'Erro interno ao deletar workspace'
        })
    }
})
