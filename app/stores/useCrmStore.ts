import { defineStore } from 'pinia'
import type { ICliente, IPaginatedResponse } from '~/types/api.types'

// Re-exporta ICliente como CrmCliente para retrocompatibilidade com componentes existentes
export type CrmCliente = ICliente

export const useCrmStore = defineStore('crmStore', {
    state: () => ({
        clientes: [] as ICliente[],
        clienteSelecionado: null as ICliente | null,
        clienteVendas: [] as any[],
        clienteMensagens: [] as any[],
        isEditModalOpen: false,
        isCreateModalOpen: false,
        searchQuery: '',
        currentPage: 1,
        itemsPerPage: 15,
        totalItems: 0,
        isLoading: false,
        error: null as string | null
    }),
    actions: {
        async fetchClientes() {
            this.isLoading = true
            this.error = null

            try {
                const response = await $fetch<IPaginatedResponse<ICliente>>('/api/crm', {
                    query: {
                        page: this.currentPage,
                        limit: this.itemsPerPage,
                        search: this.searchQuery,
                    },
                })

                this.clientes = response.data
                this.totalItems = response.total
            } catch (err: any) {
                console.error('Erro ao buscar clientes:', err)
                this.error = err.data?.message || err.message || 'Erro ao buscar clientes'
            } finally {
                this.isLoading = false
            }
        },

        async adicionarCliente(dados: Partial<ICliente>) {
            const { useToast } = await import('~/composables/useToast')
            const toast = useToast()

            try {
                const data = await $fetch<ICliente>('/api/crm', {
                    method: 'POST',
                    body: dados,
                })

                if (data) {
                    if (this.currentPage === 1) {
                        this.clientes.unshift(data)
                        if (this.clientes.length > this.itemsPerPage) {
                            this.clientes.pop()
                        }
                    }
                    this.totalItems++
                }

                this.fecharCriacao()
                toast.success('Cliente cadastrado com sucesso!')
            } catch (err: any) {
                console.error('Erro ao cadastrar cliente:', err)
                if (err.data?.message === 'UNIQUE_CONSTRAINT' || err.statusCode === 409) {
                    toast.error('Este número de contato já está cadastrado no CRM.')
                } else {
                    toast.error('Erro ao salvar o novo cliente.')
                }
            }
        },

        async atualizarCliente(id: number, dados: Partial<ICliente>) {
            const { useToast } = await import('~/composables/useToast')
            const toast = useToast()

            try {
                const data = await $fetch<ICliente>(`/api/crm/${id}`, {
                    method: 'PUT',
                    body: dados,
                })

                // Atualiza localmente sem precisar de re-fetch
                const index = this.clientes.findIndex(c => c.id === id)
                if (index !== -1 && data) {
                    this.clientes[index] = { ...this.clientes[index], ...data }
                }

                // Atualiza o selecionado se for o mesmo
                if (this.clienteSelecionado?.id === id && data) {
                    this.clienteSelecionado = { ...this.clienteSelecionado, ...data }
                }

                this.fecharEdicao()
                toast.success('Cliente atualizado com sucesso!')
            } catch (err: any) {
                console.error('Erro ao atualizar cliente:', err)
                toast.error('Erro ao salvar as alterações.')
            }
        },

        async deletarCliente(id: number) {
            const { useToast } = await import('~/composables/useToast')
            const toast = useToast()

            try {
                await $fetch(`/api/crm/${id}`, { method: 'DELETE' })

                // Remove localmente para refletir na UI rápido
                this.clientes = this.clientes.filter(c => c.id !== id)
                this.totalItems = Math.max(0, this.totalItems - 1)

                if (this.clienteSelecionado?.id === id) {
                    this.fecharDetalhes()
                }

                toast.success('Cliente removido com sucesso!')
            } catch (err: any) {
                console.error('Erro ao deletar cliente:', err)
                toast.error('Não foi possível remover o cliente.')
            }
        },

        nextPage() {
            if (this.currentPage * this.itemsPerPage < this.totalItems) {
                this.currentPage++
                this.fetchClientes()
            }
        },
        prevPage() {
            if (this.currentPage > 1) {
                this.currentPage--
                this.fetchClientes()
            }
        },
        goToPage(page: number) {
            this.currentPage = page
            this.fetchClientes()
        },

        async selecionarCliente(cliente: ICliente) {
            this.clienteSelecionado = cliente
            this.clienteVendas = []
            this.clienteMensagens = []

            try {
                const related = await $fetch<{ mensagens: any[]; vendas: any[] }>(`/api/crm/${cliente.id}/related`, {
                    query: { contato_id: cliente.contato_id },
                })

                this.clienteMensagens = related.mensagens || []
                this.clienteVendas = related.vendas || []
            } catch (error) {
                console.error('Erro ao buscar dados relacionados do cliente:', error)
            }
        },

        fecharDetalhes() {
            this.clienteSelecionado = null
        },
        abrirEdicao() {
            this.isEditModalOpen = true
        },
        fecharEdicao() {
            this.isEditModalOpen = false
        },
        abrirCriacao() {
            this.isCreateModalOpen = true
        },
        fecharCriacao() {
            this.isCreateModalOpen = false
        }
    }
})
