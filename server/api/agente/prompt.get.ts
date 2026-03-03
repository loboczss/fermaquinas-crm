import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseServiceRole(event)

    const { data, error } = await client
        .from('system_prompt_ia')
        .select('*')
        .order('id', { ascending: true })
        .limit(1)
        .single()

    if (error && error.code !== 'PGRST116') {
        throw createError({
            statusCode: 500,
            statusMessage: error.message,
        })
    }

    // Se não existir, retornar null ou mock vazio
    return data
})
