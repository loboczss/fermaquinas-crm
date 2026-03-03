import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseServiceRole(event)
    const body = await readBody(event)

    if (!body || typeof body.content !== 'string' || body.content.trim() === '') {
        throw createError({
            statusCode: 400,
            statusMessage: 'Content is required and must be a non-empty string.',
        })
    }

    const { data, error } = await client
        .from('informacoes_adicional_rag')
        .insert({ content: body.content })
        .select()
        .single()

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: error.message,
        })
    }

    // Integação com N8N Webhook para RAG
    const config = useRuntimeConfig(event)
    console.log('--- DEBUG N8N WEBHOOK ---')
    console.log('Valor da variável config.n8nWebhookRag:', config.n8nWebhookRag)

    // Fallback explícito caso a variável de .env não seja recarregada em tempo real (cache do nitro)
    const webhookUrl = config.n8nWebhookRag || process.env.N8N_WEBHOOK_RAG
    console.log('URL de Destino Real:', webhookUrl)

    if (webhookUrl && typeof webhookUrl === 'string' && webhookUrl.trim() !== '') {
        try {
            console.log('[DISPARANDO WEBHOOK N8N] POST para', webhookUrl, 'com body:', body.content)
            const n8nResponse = await $fetch(webhookUrl, {
                method: 'POST',
                body: { content: body.content }
            })
            console.log('[SUCCESS] O N8N respondeu com sucesso:', n8nResponse)
        } catch (n8nError) {
            console.error('[ERROR] Falha ao notificar servidor do N8N webhook:', n8nError)
            // Não falhamos a API inteira caso apenas o webhook venha a falhar.
        }
    } else {
        console.warn('[WARNING] URL do Webhook do N8N está vazia ou nula. Verifique se o servidor precisa ser reiniciado para carregar o arquivo .env')
    }

    return data
})
