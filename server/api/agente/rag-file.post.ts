import { serverSupabaseServiceRole } from '#supabase/server'


interface DropboxUploadResponse {
    name: string
    path_lower: string
    path_display: string
    id: string
}

interface DropboxSharedLinkResponse {
    url: string
    path_lower: string
    name: string
}

export default defineEventHandler(async (event) => {
    // 1. Ler o arquivo do FormData
    const formData = await readMultipartFormData(event)
    if (!formData || formData.length === 0) {
        throw createError({ statusCode: 400, statusMessage: 'Nenhum arquivo enviado' })
    }

    const fileField = formData.find(item => item.name === 'file' || item.name === 'documento' || item.filename)
    if (!fileField || !fileField.data || !fileField.filename) {
        throw createError({ statusCode: 400, statusMessage: 'Arquivo inválido ou ausente' })
    }

    const fileName = fileField.filename
    const fileData = fileField.data

    // Validando extensões permitidas
    const allowedExtensions = ['.pdf', '.txt', '.doc', '.docx', '.csv', '.xlsx', '.json', '.jpg', '.png']
    const fileExtension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase()
    if (!allowedExtensions.includes(fileExtension)) {
        throw createError({ statusCode: 400, statusMessage: `Extensão não permitida: ${fileExtension}` })
    }

    // 2. Upload para o Dropbox
    const accessToken = await getValidDropboxToken()
    const timestamp = Date.now()
    const uniqueFileName = `${timestamp}_${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const dropboxPath = `/database/documents-rag/${uniqueFileName}`

    let uploadResponse: DropboxUploadResponse

    try {
        uploadResponse = await $fetch<DropboxUploadResponse>('https://content.dropboxapi.com/2/files/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/octet-stream',
                'Dropbox-API-Arg': JSON.stringify({
                    path: dropboxPath,
                    mode: 'add',
                    autorename: true,
                    mute: false
                })
            },
            body: fileData
        })
    } catch (error: any) {
        console.error('[Dropbox Upload RAG] Erro:', error)
        throw createError({ statusCode: 500, statusMessage: 'Falha ao subir pro Dropbox' })
    }

    // 3. Criar link compartilhado público e converter para link direto
    let sharedLink: string
    try {
        const linkResponse = await $fetch<DropboxSharedLinkResponse>('https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: {
                path: uploadResponse.path_display,
                settings: { requested_visibility: 'public', audience: 'public', access: 'viewer' }
            }
        })
        sharedLink = linkResponse.url
    } catch (error: any) {
        if (error?.data?.error?.['.tag'] === 'shared_link_already_exists') {
            try {
                const listLinksResponse = await $fetch<{ links: DropboxSharedLinkResponse[] }>('https://api.dropboxapi.com/2/sharing/list_shared_links', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
                    body: { path: uploadResponse.path_display, direct_only: true }
                })

                if (listLinksResponse?.links && listLinksResponse.links.length > 0) {
                    const firstLink = listLinksResponse.links[0]
                    if (firstLink?.url) {
                        sharedLink = firstLink.url
                    } else {
                        throw new Error('Url nao econtrada na listagem.')
                    }
                } else {
                    throw new Error('Url nao econtrada na listagem.')
                }
            } catch (listError) {
                throw createError({ statusCode: 500, statusMessage: 'Erro ao resgatar link ja existente' })
            }
        } else {
            throw createError({ statusCode: 500, statusMessage: 'Erro ao gerar link compartilhado' })
        }
    }

    const directLink = sharedLink.replace('www.dropbox.com', 'dl.dropboxusercontent.com')
    const textoParaBanco = `Arquivo: ${fileName} - Link: ${directLink}`

    // 5. Converter Buffer para Base64 e enviar para o webhook N8N
    const config = useRuntimeConfig(event)
    const webhookUrl = config.n8nWebhookRag || process.env.N8N_WEBHOOK_RAG

    if (webhookUrl && typeof webhookUrl === 'string' && webhookUrl.trim() !== '') {
        try {
            // Conversão do Buffer (fileData) para Base64
            const base64String = fileData.toString('base64')

            console.log(`[DISPARANDO WEBHOOK N8N - ARQUIVO] POST para ${webhookUrl} com ${fileName}`)

            const n8nResponse = await $fetch(webhookUrl, {
                method: 'POST',
                body: {
                    fileName: fileName,
                    fileExtension: fileExtension.replace('.', ''), // Enviamos sem ponto ex: 'pdf', 'csv', 'png'
                    dropboxUrl: directLink,
                    base64: base64String, // <-- O Base64 desejado apenas pro webhook
                    content: textoParaBanco // Manda o texto tbm pra alinhar com requisições normais
                }
            })
            console.log('[SUCCESS N8N]', n8nResponse)
        } catch (n8nError) {
            console.error('[ERROR N8N]', n8nError)
        }
    }

    return { success: true, message: 'File uploaded to Dropbox and sent to Webhook' }
})
