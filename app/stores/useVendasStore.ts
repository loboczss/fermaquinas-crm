import { defineStore } from 'pinia'
import type { IVenda, IPaginatedResponse } from '~/types/api.types'

// Re-exporta para retrocompatibilidade
export type Venda = IVenda

export const useVendasStore = defineStore('vendasStore', {
    state: () => ({
        vendas: [] as IVenda[],
        currentPage: 1,
        itemsPerPage: 15,
        totalItems: 0,
        isLoading: false,
        isCreateModalOpen: false,
        error: null as string | null,
    }),

    actions: {
        abrirCriacao() {
            this.isCreateModalOpen = true
        },
        fecharCriacao() {
            this.isCreateModalOpen = false
        },

        async fetchVendas() {
            this.isLoading = true
            this.error = null

            try {
                const response = await $fetch<IPaginatedResponse<IVenda>>('/api/vendas', {
                    query: {
                        page: this.currentPage,
                        limit: this.itemsPerPage,
                    },
                })

                this.vendas = response.data
                this.totalItems = response.total
            } catch (err: any) {
                this.error = err.data?.message || err.message || 'Erro ao buscar vendas'
                console.error('Erro ao buscar vendas:', err)
            } finally {
                this.isLoading = false
            }
        },

        async criarVenda(dados: Partial<IVenda>) {
            const toast = useToast()

            try {
                const data = await $fetch<IVenda>('/api/vendas', {
                    method: 'POST',
                    body: dados,
                })

                toast.success('Venda cadastrada com sucesso!')

                // Se estiver na página 1, adiciona ao topo
                if (this.currentPage === 1 && data) {
                    this.vendas.unshift(data)
                    this.totalItems++
                    if (this.vendas.length > this.itemsPerPage) {
                        this.vendas.pop()
                    }
                } else {
                    this.fetchVendas()
                }

                this.fecharCriacao()
            } catch (err: any) {
                toast.error('Erro ao criar venda')
                console.error('Erro criar venda:', err)
                throw err
            }
        },

        async deleteVenda(id: number, devolverEstoque: boolean = false) {
            const toast = useToast()

            try {
                await $fetch(`/api/vendas/${id}`, {
                    method: 'DELETE',
                    query: { devolver_estoque: devolverEstoque }
                })
                toast.success('Venda excluída com sucesso!')
                this.vendas = this.vendas.filter(v => v.id !== id)
                this.totalItems--
            } catch (err: any) {
                const msg = err.data?.message || 'Erro ao excluir venda'
                toast.error(msg)
                console.error('[VendasStore] Erro ao excluir venda:', err)
                throw err
            }
        }
    }
})
