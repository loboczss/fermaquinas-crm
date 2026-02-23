import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'

/**
 * Endpoint: PUT /api/perfil/me
 * 
 * Atualiza o nome (full_name), telefone (phone) e avatar_url do usuário autenticado.
 */
export default defineEventHandler(async (event) => {
    try {
        const client = await serverSupabaseClient(event)
        const serviceRole = serverSupabaseServiceRole(event)

        // Obter o usuário da sessão atual
        const { data: { user }, error: sessionError } = await client.auth.getUser()

        if (sessionError || !user || !user.id) {
            throw createError({
                statusCode: 401,
                statusMessage: 'Unauthorized',
                message: 'Usuário não autenticado'
            })
        }

        // Obter os dados do corpo da requisição
        const body = await readBody(event)

        // Extraindo campos permitidos para proteger de injection de outros campos
        const { full_name, phone, avatar_url } = body

        if (full_name === undefined && phone === undefined && avatar_url === undefined) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Bad Request',
                message: 'Nenhum dado válido fornecido para atualização'
            })
        }

        // Montando payload do metadata a atualizar (full_name e phone vão para user_metadata)
        const updateData: { full_name?: string, phone?: string, avatar_url?: string } = {}
        if (full_name !== undefined) updateData.full_name = full_name
        if (phone !== undefined) updateData.phone = phone
        if (avatar_url !== undefined) updateData.avatar_url = avatar_url

        // Atualizar no Supabase Auth (user_metadata) se houver dados
        if (Object.keys(updateData).length > 0) {
            const { error: updateError } = await client.auth.updateUser({
                data: updateData
            })

            if (updateError) {
                throw updateError
            }
        }

        // Atualizar avatar_url na tabela profiles (usa serviceRole para bypass RLS)
        if (avatar_url !== undefined) {
            const { error: profileError } = await serviceRole
                .from('profiles')
                .update({ avatar_url })
                .eq('user_id', user.id)

            if (profileError) {
                console.error('[API perfil/me.put] Erro ao atualizar avatar_url:', profileError)
                throw createError({
                    statusCode: 500,
                    statusMessage: 'Database Error',
                    message: 'Erro ao atualizar avatar na tabela profiles'
                })
            }
        }

        return {
            message: 'Perfil atualizado com sucesso',
            user: {
                id: user.id,
                full_name: full_name !== undefined ? full_name : user.user_metadata?.full_name,
                phone: phone !== undefined ? phone : user.user_metadata?.phone,
                avatar_url: avatar_url !== undefined ? avatar_url : undefined
            }
        }
    } catch (error: any) {
        if (error.statusCode) {
            throw error
        }

        throw createError({
            statusCode: 500,
            statusMessage: 'Internal Server Error',
            message: error.message || 'Erro ao atualizar perfil do usuário'
        })
    }
})
