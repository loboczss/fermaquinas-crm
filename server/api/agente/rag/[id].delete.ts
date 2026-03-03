import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/types/database.types'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseServiceRole<Database>(event)
    const id = getRouterParam(event, 'id')

    if (!id) {
        throw createError({
            statusCode: 400,
            statusMessage: 'ID is required',
        })
    }

    const numId = parseInt(id, 10)
    if (isNaN(numId)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid ID format',
        })
    }

    const { error } = await client
        .from('informacoes_adicional_rag')
        .delete()
        .eq('id', numId)

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: error.message,
        })
    }

    return { success: true }
})
