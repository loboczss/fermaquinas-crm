import { defineStore } from 'pinia'
import type { UserProfile } from '~/types/profile.types'

interface ProfileState {
  profile: UserProfile | null
  loading: boolean
  error: string | null
}

export const useProfileStore = defineStore('profile', {
  state: (): ProfileState => ({
    profile: null,
    loading: false,
    error: null
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
      this.loading = true
      this.error = null

      try {
        const data = await $fetch<UserProfile>('/api/perfil/me', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (data) {
          this.profile = data
        }
      } catch (err: any) {
        this.error = err.message || 'Erro ao buscar perfil do usuário'
        console.error('[ProfileStore] Erro ao buscar perfil:', err)
      } finally {
        this.loading = false
      }
    },

    /**
     * Atualiza os dados do perfil via API (PUT)
     */
    async updateProfile(payload: { full_name?: string; phone?: string; avatar_url?: string }) {
      this.loading = true
      this.error = null

      try {
        const data = await $fetch<{ message: string, user: any }>('/api/perfil/me', {
          method: 'PUT',
          body: payload
        })

        if (data && this.profile) {
          // Atualiza o estado local com os dados retornados do servidor
          if (data.user.full_name !== undefined) this.profile.full_name = data.user.full_name
          if (data.user.phone !== undefined) this.profile.phone = data.user.phone
          if (data.user.avatar_url !== undefined) this.profile.avatar_url = data.user.avatar_url
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
