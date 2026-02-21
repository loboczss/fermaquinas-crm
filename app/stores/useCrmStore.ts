import { defineStore } from 'pinia'
import { formatClientName } from '~/utils/formatters'

export interface CrmCliente {
    id: number
    created_at: string
    contato_id: string
    nome: string | null
    nome_social: string | null
    cidade: string | null
    email: string | null
    data_nascimento: string | null
    sentimento: string | null
    urgencia: string | null
    resumo_perfil: string | null
    interesses: string | null
    objeccoes: string | null
    fase_obra: string | null
    deleted_at: string | null
    deleted_by: string | null
}

export const useCrmStore = defineStore('crmStore', {
    state: () => ({
        clientes: [] as CrmCliente[],
        clienteSelecionado: null as CrmCliente | null,
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
            const client = useSupabaseClient()
            this.isLoading = true
            this.error = null

            const from = (this.currentPage - 1) * this.itemsPerPage
            const to = from + this.itemsPerPage - 1

            try {
                let query = client
                    .from('crm_fermaquinas')
                    .select('*', { count: 'exact' })
                    .is('deleted_at', null)

                if (this.searchQuery && this.searchQuery.trim() !== '') {
                    const q = `%${this.searchQuery.trim()}%`
                    query = query.or(`nome.ilike.${q},nome_social.ilike.${q},contato_id.ilike.${q}`)
                }

                const { data, error, count } = await query
                    .order('created_at', { ascending: false })
                    .range(from, to)

                if (error) throw error
                this.clientes = (data as CrmCliente[]) || []
                if (count !== null) {
                    this.totalItems = count
                }
            } catch (err: any) {
                console.error('Erro ao buscar clientes:', err)
                this.error = err.message
            } finally {
                this.isLoading = false
            }
        },
        async adicionarCliente(dados: Partial<CrmCliente>) {
            const client = useSupabaseClient()
            const { useToast } = await import('~/composables/useToast')
            const toast = useToast()

            // Define defaults
            const payload = { ...dados }
            if (!payload.sentimento) payload.sentimento = 'Neutro'
            if (!payload.urgencia) payload.urgencia = 'Baixa'
            if (!payload.fase_obra) payload.fase_obra = 'Indefinido'

            try {
                const { data, error } = await client
                    .from('crm_fermaquinas')
                    .insert(payload)
                    .select()
                    .single()

                if (error) {
                    if (error.code === '23505') {
                        throw new Error('UNIQUE_CONSTRAINT')
                    }
                    throw error
                }

                if (data) {
                    if (this.currentPage === 1) {
                        this.clientes.unshift(data as CrmCliente)
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
                if (err.message === 'UNIQUE_CONSTRAINT') {
                    toast.error('Este número de contato já está cadastrado no CRM.')
                } else {
                    toast.error('Erro ao salvar o novo cliente.')
                }
            }
        },
        async atualizarCliente(id: number, dados: Partial<CrmCliente>) {
            const client = useSupabaseClient()
            const { useToast } = await import('~/composables/useToast') // dynamic import
            const toast = useToast()

            // Segurança: contato_id NUNCA deve ser atualizado
            const payload = { ...dados }
            delete payload.contato_id

            try {
                const { data, error } = await client
                    .from('crm_fermaquinas')
                    .update(payload)
                    .eq('id', id)
                    .select()
                    .single()

                if (error) throw error

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
            const client = useSupabaseClient()
            const user = useSupabaseUser()
            const { useToast } = await import('~/composables/useToast')
            const toast = useToast()

            try {
                const { error } = await client
                    .from('crm_fermaquinas')
                    .update({
                        deleted_at: new Date().toISOString(),
                        deleted_by: user.value?.id || null
                    })
                    .eq('id', id)

                if (error) throw error

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
        async selecionarCliente(cliente: CrmCliente) {
            this.clienteSelecionado = cliente
            this.clienteVendas = []
            this.clienteMensagens = []

            const client = useSupabaseClient()
            try {
                // Fetch Mensagens
                const { data: mensagens } = await client
                    .from('historico_msg_fermaquinas')
                    .select('*')
                    .eq('contato_id', cliente.contato_id)
                    .order('created_at', { ascending: false })
                    .limit(20)

                // Fetch Vendas
                const { data: vendas } = await client
                    .from('historico_vendas_fermaquinas')
                    .select('*')
                    .eq('contato_id', cliente.contato_id)
                    .is('deleted_at', null)
                    .order('created_at', { ascending: false })

                if (mensagens) this.clienteMensagens = mensagens
                if (vendas) this.clienteVendas = vendas
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
