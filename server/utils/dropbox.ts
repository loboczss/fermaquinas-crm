/**
 * Utilitário de autenticação Dropbox
 * 
 * Gerencia a renovação automática do access_token usando o refresh_token.
 * O Dropbox OAuth2 exige que o access_token seja renovado periodicamente.
 */

interface DropboxTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

/**
 * Obtém um access_token válido do Dropbox usando o refresh_token
 * 
 * @returns Promise<string> - Access token válido
 * @throws Error se a renovação falhar
 */
export async function getValidDropboxToken(): Promise<string> {
  const config = useRuntimeConfig()

  const clientId = config.dropboxClientId
  const clientSecret = config.dropboxClientSecret
  const refreshToken = config.dropboxRefreshToken

  // Validação das credenciais
  if (!clientId || !clientSecret || !refreshToken) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Dropbox credentials not configured',
      message: 'Missing DROPBOX_CLIENT_ID, DROPBOX_CLIENT_SECRET or DROPBOX_REFRESH_TOKEN in environment variables'
    })
  }

  try {
    // Requisição para renovar o access_token usando o refresh_token
    const response = await $fetch<DropboxTokenResponse>('https://api.dropbox.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      }).toString()
    })

    // Retorna o novo access_token
    return response.access_token

  } catch (error: any) {
    console.error('[Dropbox Auth] Erro ao renovar token:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Dropbox Authentication Failed',
      message: error?.data?.error_description || 'Failed to refresh Dropbox access token'
    })
  }
}
