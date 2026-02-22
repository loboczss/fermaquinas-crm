import { defineStore } from 'pinia'
import type { UserRole, IUserRoleResponse } from '~/types/api.types'

interface AuthState {
  userRole: UserRole | null
  userId: string | null
  loading: boolean
  error: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    userRole: null,
    userId: null,
    loading: false,
    error: null,
  }),

  getters: {
    /** Retorna true se o usuário logado é master */
    isMaster: (state): boolean => state.userRole === 'master',

    /** Retorna true se os dados de role já foram carregados */
    isRoleLoaded: (state): boolean => state.userRole !== null,
  },

  actions: {
    /**
     * Busca o role do usuário autenticado via API.
     * Deve ser chamada logo após o login / montagem do layout autenticado.
     */
    async fetchUserRole() {
      if (this.userRole) return // Já carregado, evita re-fetch

      this.loading = true
      this.error = null

      try {
        const data = await $fetch<IUserRoleResponse>('/api/auth/role')
        this.userRole = data.role as UserRole
        this.userId = data.userId
      } catch (err: any) {
        console.error('[AuthStore] Erro ao buscar role:', err)
        this.error = err.message || 'Erro ao buscar cargo do usuário'
        // Fallback seguro — restringe acesso
        this.userRole = 'vendedor'
      } finally {
        this.loading = false
      }
    },

    /** Limpa o estado (chamar no logout) */
    clearAuth() {
      this.userRole = null
      this.userId = null
      this.error = null
      this.loading = false
    },
  },
})
