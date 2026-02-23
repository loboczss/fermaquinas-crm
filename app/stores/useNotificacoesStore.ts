import { defineStore } from 'pinia'
import type { INotificacao } from '~/types/api.types'

export const useNotificacoesStore = defineStore('notificacoes', {
    state: () => ({
        notificacoes: [] as INotificacao[],
        totalNaoLidas: 0,
        loading: false,
        error: null as string | null,
        fetchPromise: null as Promise<void> | null,
    }),

    getters: {
        temNaoLidas: (state) => state.totalNaoLidas > 0,
        naoLidas: (state) => state.notificacoes.filter(n => !n.lida),
    },

    actions: {
        async fetchNotificacoes() {
            if (this.fetchPromise) {
                return this.fetchPromise
            }

            this.fetchPromise = (async () => {
                this.loading = true
                this.error = null

                try {
                    const response = await $fetch<{ data: INotificacao[], total_nao_lidas: number }>('/api/notificacoes', {
                        query: { limit: 20 }
                    })
                    this.notificacoes = response.data || []
                    this.totalNaoLidas = response.total_nao_lidas || 0
                } catch (err: any) {
                    this.error = err.message || 'Erro ao carregar notificações'
                    console.error('[NotificacoesStore] Erro fetch:', err)
                } finally {
                    this.loading = false
                    this.fetchPromise = null
                }
            })()

            return this.fetchPromise
        },

        async marcarComoLida(ids: number[]) {
            try {
                await $fetch('/api/notificacoes/ler', {
                    method: 'PUT',
                    body: { ids }
                })

                // Atualiza estado local
                let lidasAgora = 0
                this.notificacoes.forEach(n => {
                    if (ids.includes(n.id) && !n.lida) {
                        n.lida = true
                        lidasAgora++
                    }
                })
                this.totalNaoLidas = Math.max(0, this.totalNaoLidas - lidasAgora)
            } catch (err) {
                console.error('[NotificacoesStore] Erro ao marcar como lida:', err)
            }
        },

        async marcarTodasComoLidas() {
            try {
                await $fetch('/api/notificacoes/ler', {
                    method: 'PUT',
                    body: { todas: true }
                })

                // Atualiza estado local
                this.notificacoes.forEach(n => n.lida = true)
                this.totalNaoLidas = 0
            } catch (err) {
                console.error('[NotificacoesStore] Erro ao marcar todas como lidas:', err)
            }
        },

        async verificarAniversarios() {
            try {
                await $fetch('/api/notificacoes/verificar-aniversarios', {
                    method: 'POST'
                })
                // Atualiza lista em seguida
                await this.fetchNotificacoes()
            } catch (err) {
                console.error('[NotificacoesStore] Erro verificar aniversários:', err)
            }
        }
    }
})
