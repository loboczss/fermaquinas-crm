/**
 * Interface para os dados do perfil do usuário
 * Retornado pelo endpoint /api/perfil/me
 */
export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  created_at: string
  updated_at: string
  email_verified: boolean
  phone: string | null
  phone_verified: boolean
  role: 'master' | 'vendedor' | null
}
