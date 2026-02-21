import { serverSupabaseClient } from '#supabase/server'

/**
 * Endpoint: PUT /api/perfil/me
 * 
 * Atualiza o nome (full_name) e telefone (phone) do usuário autenticado.
 */
export default defineEventHandler(async (event) => {
    try {
        const client = await serverSupabaseClient(event)

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

        // Extraindo apenas nome e telefone para proteger de injection de outros campos
        const { full_name, phone } = body

        if (full_name === undefined && phone === undefined) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Bad Request',
                message: 'Nenhum dado válido fornecido para atualização'
            })
        }

        // Montando payload do metadata a atualizar
        const updateData: { full_name?: string, phone?: string } = {}
        if (full_name !== undefined) updateData.full_name = full_name
        if (phone !== undefined) updateData.phone = phone

        // Atualizar no Supabase Auth (user_metadata)
        const { data: updatedUser, error: updateError } = await client.auth.updateUser({
            data: updateData
        })

        if (updateError) {
            throw updateError
        }

        // Se a gente tivesse a tabela profiles separada para dar update sincronizado:
        // UPDATE public.profiles seria aqui usando a serverSupabaseServiceRole, 
        // mas os dados full_name e phone costumam ir em user_metadata no auth.users como visto na rota me.get.ts.
        // Vamos dar return do status de sucesso.

        return {
            message: 'Perfil atualizado com sucesso',
            user: {
                id: updatedUser.user.id,
                full_name: updatedUser.user.user_metadata?.full_name,
                phone: updatedUser.user.user_metadata?.phone
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
