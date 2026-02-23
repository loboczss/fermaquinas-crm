import { defineStore } from 'pinia'
import type { UserProfile } from '~/types/profile.types'

interface ProfileState {
  profile: UserProfile | null
  loading: boolean
  error: string | null
  fetchPromise: Promise<void> | null
}

export const useProfileStore = defineStore('profile', {
  state: (): ProfileState => ({
    profile: null,
    loading: false,
    error: null,
    fetchPromise: null
  }),

  getters: {
    /**
     * Retorna o nome completo do usuário ou 'Usuário' como fallback
     */
    userName: (state): string => {
      return state.profile?.full_name || 'Usuário'
    },

    /**
     * Retorna o email do usuário
     */
    userEmail: (state): string => {
      return state.profile?.email || ''
    },

    /**
     * Retorna as iniciais do nome do usuário
     */
    userInitials: (state): string => {
      const name = state.profile?.full_name || 'U'
      return name.charAt(0).toUpperCase()
    },

    /**
     * Verifica se o perfil está carregado
     */
    isLoaded: (state): boolean => {
      return state.profile !== null
    }
  },

  actions: {
    /**
     * Busca os dados do perfil do usuário autenticado via API
     */
    async fetchProfile() {
      // Se já houver uma busca em andamento, aguarda ela terminar para não duplicar chamadas
      if (this.fetchPromise) {
        return this.fetchPromise
      }

      this.fetchPromise = (async () => {
        this.loading = true
        this.error = null

        try {
          const data = await $fetch<UserProfile>('/api/perfil/me', {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            }
          })

          console.log('[ProfileStore] Resposta bruta da API /api/perfil/me:', JSON.stringify(data))

          if (data) {
            this.profile = data
            console.log('[ProfileStore] Perfil setado no store:', JSON.stringify(this.profile))
          } else {
            console.warn('[ProfileStore] API retornou dados vazios ou null, mantendo o estado atual.')
          }
        } catch (err: any) {
          this.error = err.message || 'Erro ao buscar perfil do usuário'
          console.error('[ProfileStore] Erro ao buscar perfil:', err)
        } finally {
          this.loading = false
          this.fetchPromise = null
        }
      })()

      return this.fetchPromise
    },

    /**
     * Atualiza os dados do perfil via API (PUT)
     */
    async updateProfile(payload: { full_name?: string; phone?: string; avatar_url?: string }) {
      this.loading = true
      this.error = null

      try {
        console.log('[ProfileStore] Enviando atualização:', payload)

        const data = await $fetch<{ message: string, user: any }>('/api/perfil/me', {
          method: 'PUT',
          body: payload
        })

        console.log('[ProfileStore] Resposta do PUT:', data)

        if (data) {
          console.log('[ProfileStore] Atualizando estado local do perfil...')
          this.profile = { ...this.profile, ...(data.user || data) } as UserProfile
          console.log('[ProfileStore] Perfil atualizado:', this.profile)
        }
        return { success: true }
      } catch (err: any) {
        const errorMessage = err.data?.message || err.message || 'Erro ao atualizar perfil'
        this.error = errorMessage
        console.error('[ProfileStore] Erro ao atualizar perfil:', err)
        return { success: false, error: errorMessage }
      } finally {
        this.loading = false
      }
    },

    /**
     * Atualiza os dados do perfil localmente
     */
    updateProfileData(data: Partial<UserProfile>) {
      if (this.profile) {
        this.profile = {
          ...this.profile,
          ...data
        }
      }
    },

    /**
     * Limpa o estado do perfil (útil no logout)
     */
    clearProfile() {
      this.profile = null
      this.error = null
      this.loading = false
    },

    /**
     * Recarrega o perfil do usuário
     */
    async refreshProfile() {
      await this.fetchProfile()
    }
  }
})
