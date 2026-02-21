import { defineStore } from 'pinia'

export interface Venda {
    id: number
    created_at: string
    id_mensagem_venda: number | null
    contato_id: string
    valor_venda: number | null
    contact_name: string | null
    vendedor: string | null
    produtos: string | null
    deleted_at: string | null
    deleted_by: string | null
    vendedor_id: string | null
    cliente?: {
        nome: string | null
        nome_social: string | null
    }
}

export const useVendasStore = defineStore('vendasStore', {
    state: () => ({
        vendas: [] as Venda[],
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
            const client = useSupabaseClient()
            this.isLoading = true
            this.error = null

            try {
                const from = (this.currentPage - 1) * this.itemsPerPage
                const to = from + this.itemsPerPage - 1

                let query = client
                    .from('historico_vendas_fermaquinas')
                    .select('*', { count: 'exact' })
                    .is('deleted_at', null)

                query = query.order('created_at', { ascending: false }).range(from, to)

                const { data, count, error } = await query

                if (error) throw error

                this.vendas = (data as any) ?? []
                this.totalItems = count ?? 0
            } catch (err: any) {
                this.error = err.message
                console.error('Erro ao buscar vendas:', err)
            } finally {
                this.isLoading = false
            }
        },

        async criarVenda(dados: Partial<Venda>) {
            const client = useSupabaseClient()
            const user = useSupabaseUser()
            const toast = useToast()

            try {
                const payload = {
                    ...dados,
                    vendedor_id: user.value?.id,
                    vendedor: dados.vendedor || user.value?.user_metadata?.full_name || user.value?.email || 'Vendedor Desconhecido',
                }

                const { data, error } = await client
                    .from('historico_vendas_fermaquinas')
                    .insert(payload)
                    .select('*')
                    .single()

                if (error) throw error

                toast.success('Venda cadastrada com sucesso!')

                // Se estiver na página 1, adiciona ao topo
                if (this.currentPage === 1 && data) {
                    this.vendas.unshift(data as any)
                    this.totalItems++
                    // Remova o último se passar do limite da página para manter a consistência visual local
                    if (this.vendas.length > this.itemsPerPage) {
                        this.vendas.pop()
                    }
                } else {
                    this.fetchVendas() // Recarrega se estiver em outra página
                }

                this.fecharCriacao()
            } catch (err: any) {
                toast.error('Erro ao criar venda')
                console.error('Erro criar venda:', err)
                throw err
            }
        }
    }
})
