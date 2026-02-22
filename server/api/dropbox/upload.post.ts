/**
 * API Route: POST /api/dropbox/upload
 * 
 * Faz upload de uma imagem para o Dropbox e retorna um link direto público.
 * 
 * Fluxo:
 * 1. Recebe arquivo via multipart/form-data
 * 2. Obtém access_token válido do Dropbox
 * 3. Faz upload do arquivo para /Fermaquinas/Fotos/
 * 4. Cria link compartilhado público
 * 5. Converte para link direto (raw=1)
 * 
 * @returns { success: true, foto_url: string }
 */

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

interface UploadSuccessResponse {
  success: true
  foto_url: string
}

export default defineEventHandler(async (event): Promise<UploadSuccessResponse> => {
  // ============================================
  // PASSO A: Ler arquivo do FormData
  // ============================================
  
  const formData = await readMultipartFormData(event)
  
  if (!formData || formData.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Nenhum arquivo foi enviado'
    })
  }

  // Procura pelo campo de arquivo (normalmente 'file' ou 'foto')
  const fileField = formData.find(item => 
    item.name === 'file' || 
    item.name === 'foto' || 
    item.filename
  )

  if (!fileField || !fileField.data || !fileField.filename) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Arquivo inválido ou ausente'
    })
  }

  const fileName = fileField.filename
  const fileData = fileField.data

  // Validação de tipo de arquivo (opcional - ajuste conforme necessário)
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  const fileExtension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase()
  
  if (!allowedExtensions.includes(fileExtension)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid File Type',
      message: `Apenas imagens são permitidas: ${allowedExtensions.join(', ')}`
    })
  }

  // ============================================
  // PASSO B: Obter token válido do Dropbox
  // ============================================
  
  const accessToken = await getValidDropboxToken()

  // ============================================
  // PASSO C: Upload do arquivo para Dropbox
  // ============================================
  
  // Gera nome único com timestamp
  const timestamp = Date.now()
  const uniqueFileName = `${timestamp}_${fileName}`
  const dropboxPath = `/Fermaquinas/Fotos/${uniqueFileName}`

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

    console.log('[Dropbox Upload] Arquivo enviado com sucesso:', uploadResponse.path_display)

  } catch (error: any) {
    console.error('[Dropbox Upload] Erro ao enviar arquivo:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Upload Failed',
      message: error?.data?.error_summary || 'Falha ao fazer upload do arquivo para o Dropbox'
    })
  }

  // ============================================
  // PASSO D: Criar link compartilhado público
  // ============================================
  
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
        settings: {
          requested_visibility: 'public',
          audience: 'public',
          access: 'viewer'
        }
      }
    })

    sharedLink = linkResponse.url

  } catch (error: any) {
    // Se o link já existe, tenta listar os links existentes
    if (error?.data?.error?.['.tag'] === 'shared_link_already_exists') {
      console.log('[Dropbox] Link já existe, buscando link existente...')
      
      try {
        const listLinksResponse = await $fetch<{ links: DropboxSharedLinkResponse[] }>('https://api.dropboxapi.com/2/sharing/list_shared_links', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: {
            path: uploadResponse.path_display,
            direct_only: true
          }
        })

        if (listLinksResponse.links && listLinksResponse.links.length > 0) {
          sharedLink = listLinksResponse.links[0].url
        } else {
          throw new Error('Link compartilhado não encontrado')
        }

      } catch (listError: any) {
        console.error('[Dropbox] Erro ao listar links:', listError)
        throw createError({
          statusCode: 500,
          statusMessage: 'Link Creation Failed',
          message: 'Não foi possível obter o link compartilhado'
        })
      }
    } else {
      console.error('[Dropbox] Erro ao criar link compartilhado:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Link Creation Failed',
        message: error?.data?.error_summary || 'Falha ao criar link compartilhado'
      })
    }
  }

  // ============================================
  // PASSO E: Converter para link direto (raw)
  // ============================================
  
  // Substitui '?dl=0' por '?raw=1' para link direto de imagem
  const directLink = sharedLink.replace('?dl=0', '?raw=1').replace('www.dropbox.com', 'dl.dropboxusercontent.com')

  console.log('[Dropbox] Link direto gerado:', directLink)

  // ============================================
  // RETORNO: URL da foto
  // ============================================
  
  return {
    success: true,
    foto_url: directLink
  }
})
