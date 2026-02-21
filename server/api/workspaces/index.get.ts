import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
    try {
        // 1. Obter a sessão do cliente para validar a autenticação do usuário
        const authClient = await serverSupabaseClient(event)
        const { data: { user }, error: sessionError } = await authClient.auth.getUser()

        if (sessionError || !user || !user.id) {
            throw createError({
                statusCode: 401,
                statusMessage: 'Unauthorized',
                message: 'Usuário não autenticado'
            })
        }

        // 2. Usar o Service Role para driblar o RLS e acessar a tabela public.workspaces
        const serviceRoleClient = serverSupabaseServiceRole(event)

        // A tabela referenciou "profiles (user_id)" e "auth.users", então o user.id será nossa base de filtro.
        const { data: workspaces, error: fetchError } = await serviceRoleClient
            .from('workspaces')
            .select('id, nome, descricao, created_at')
            .eq('user_id', user.id)
            .is('deleted_by', null)
            // OPCIONAL: ordenar por criação mais recente se desejar
            .order('created_at', { ascending: false })

        console.log('[API Workspaces] Buscando para o user:', user.id)
        if (fetchError) {
            console.error('[API Workspaces] Erro no Supabase:', fetchError)
            throw fetchError
        }
        console.log('[API Workspaces] Encontrados:', workspaces?.length)

        return {
            workspaces: workspaces || []
        }
    } catch (error: any) {
        if (error.statusCode) {
            throw error
        }

        throw createError({
            statusCode: 500,
            statusMessage: 'Internal Server Error',
            message: error.message || 'Erro ao buscar workspaces do usuário'
        })
    }
})
