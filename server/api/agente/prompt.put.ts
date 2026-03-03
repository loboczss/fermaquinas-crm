import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseServiceRole(event)
    const body = await readBody(event)

    if (!body || typeof body.prompt !== 'string') {
        throw createError({
            statusCode: 400,
            statusMessage: 'Prompt is required and must be a string.',
        })
    }

    // Tenta buscar o primeiro
    const { data: existing } = await client
        .from('system_prompt_ia')
        .select('id')
        .order('id', { ascending: true })
        .limit(1)
        .single()

    let result
    let error

    if (existing) {
        const response = await client
            .from('system_prompt_ia')
            .update({ prompt: body.prompt })
            .eq('id', existing.id)
            .select()
            .single()
        result = response.data
        error = response.error
    } else {
        const response = await client
            .from('system_prompt_ia')
            .insert({ prompt: body.prompt })
            .select()
            .single()
        result = response.data
        error = response.error
    }

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: error.message,
        })
    }

    return result
})
