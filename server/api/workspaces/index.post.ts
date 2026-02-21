import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
    try {
        // 1. Validar a sessão do usuário
        const authClient = await serverSupabaseClient(event)
        const { data: { user }, error: sessionError } = await authClient.auth.getUser()

        if (sessionError || !user || !user.id) {
            throw createError({
                statusCode: 401,
                statusMessage: 'Unauthorized',
                message: 'Usuário não autenticado'
            })
        }

        // 2. Extrair dados do corpo da requisição
        const body = await readBody(event)
        const { name, description } = body

        if (!name || typeof name !== 'string') {
            throw createError({
                statusCode: 400,
                statusMessage: 'Bad Request',
                message: 'O nome do workspace é obrigatório'
            })
        }

        // 3. Inserir no banco usando Service Role (bypass RLS)
        const serviceRoleClient = serverSupabaseServiceRole(event)

        const { data: newWorkspace, error: insertError } = await serviceRoleClient
            .from('workspaces')
            .insert({
                nome: name.trim(),
                descricao: description ? description.trim() : null,
                user_id: user.id
            })
            .select('id, nome, descricao, created_at')
            .single()

        if (insertError) {
            console.error('[API Workspaces] Erro ao criar workspace:', insertError)
            throw insertError
        }

        return newWorkspace
    } catch (error: any) {
        if (error.statusCode) throw error

        throw createError({
            statusCode: 500,
            statusMessage: 'Internal Server Error',
            message: error.message || 'Erro interno ao criar workspace'
        })
    }
})
