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
     * Só faz requisição se houver userId.
     */
    async fetchUserRole() {
      if (this.userRole) return // Já carregado, evita re-fetch

      this.loading = true
      this.error = null

      try {
        const data = await $fetch<IUserRoleResponse>('/api/auth/role')
        // Só atualiza se realmente recebeu um userId (significa que tem sessão)
        if (data.userId) {
          this.userRole = data.role as UserRole
          this.userId = data.userId
        } else {
          // Sem sessão, não persiste o vendedor como role
          this.userRole = 'vendedor'
        }
      } catch (err: any) {
        console.error('[AuthStore] Erro ao buscar role:', err)
        this.error = err.message || 'Erro ao buscar cargo do usuário'
        // Fallback seguro — restringe acesso
        this.userRole = 'vendedor'
      } finally {
        this.loading = false
      }
    },

    /**
     * Inicializa o perfil do usuário (cria se não existir)
     * Deve ser chamada quando usuário faz login
     */
    async initializeProfile() {
      try {
        const response = await $fetch('/api/perfil/initialize', {
          method: 'POST'
        })
        console.log('[AuthStore] Perfil inicializado:', response)
        return response
      } catch (err: any) {
        console.error('[AuthStore] Erro ao inicializar perfil:', err)
        // Não é crítico, o usuário continuará podendo usar a app
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
