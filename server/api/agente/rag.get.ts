import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseServiceRole(event)

    const { data, error } = await client
        .from('informacoes_adicional_rag')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: error.message,
        })
    }

    return data
})
