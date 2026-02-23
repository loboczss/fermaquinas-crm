import { defineStore } from 'pinia'
import type { IProduto, IPaginatedResponse } from '~/types/api.types'

export const useProdutosStore = defineStore('produtosStore', {
    state: () => ({
        produtos: [] as IProduto[],
        total: 0,
        page: 1,
        limit: 30,
        loading: false,
        searchQuery: '',
        error: null as string | null,
    }),

    actions: {
        async fetchProdutos(page?: number) {
            if (page) this.page = page
            this.loading = true
            this.error = null

            try {
                const response = await $fetch<IPaginatedResponse<IProduto>>('/api/produtos', {
                    query: {
                        page: this.page,
                        limit: this.limit,
                    },
                })

                this.produtos = response.data
                this.total = response.total
            } catch (err: any) {
                this.error = err.data?.message || err.message || 'Erro ao buscar produtos'
                console.error('Erro ao buscar produtos:', err)
            } finally {
                this.loading = false
            }
        },

        async searchProdutos(query: string, page?: number) {
            this.searchQuery = query
            if (page) this.page = page
            else this.page = 1 // Reset pagination on new search

            if (!query.trim()) {
                return this.fetchProdutos(this.page)
            }

            this.loading = true
            this.error = null

            try {
                const response = await $fetch<IPaginatedResponse<IProduto>>('/api/produtos/search', {
                    query: {
                        q: this.searchQuery,
                        page: this.page,
                        limit: this.limit,
                    },
                })

                this.produtos = response.data
                this.total = response.total
            } catch (err: any) {
                this.error = err.data?.message || err.message || 'Erro ao buscar produtos'
                console.error('Erro ao buscar produtos:', err)
            } finally {
                this.loading = false
            }
        },

        setPage(page: number) {
            this.page = page
            if (this.searchQuery.trim()) {
                this.searchProdutos(this.searchQuery, page)
            } else {
                this.fetchProdutos(page)
            }
        },

        async deleteProduto(id: number) {
            try {
                await $fetch('/api/produtos', {
                    method: 'DELETE',
                    query: { id }
                })

                // Remover do estado local
                this.produtos = this.produtos.filter(p => p.IDPRODUTO !== id)
                this.total--

                return { success: true }
            } catch (err: any) {
                console.error('Erro ao excluir produto:', err)
                throw err
            }
        },

        async updateProduto(produto: Partial<IProduto>) {
            try {
                const response = await $fetch<{ success: boolean, data: IProduto }>('/api/produtos', {
                    method: 'PUT',
                    body: produto
                })

                // Atualizar estado local
                if (response.success && response.data) {
                    const index = this.produtos.findIndex(p => p.IDPRODUTO === response.data.IDPRODUTO)
                    if (index !== -1) {
                        this.produtos[index] = response.data
                    }
                }

                return { success: true }
            } catch (err: any) {
                console.error('Erro ao atualizar produto:', err)
                throw err
            }
        }
    },

    getters: {
        totalPages(state) {
            return Math.ceil(state.total / state.limit)
        },
        hasProducts(state) {
            return state.produtos.length > 0
        }
    }
})
