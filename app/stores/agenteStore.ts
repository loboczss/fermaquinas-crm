import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SystemPrompt, InformacaoRag } from '~/../shared/types/Agente'

export const useAgenteStore = defineStore('agente', () => {
    const systemPrompt = ref<SystemPrompt | null>(null)
    const ragList = ref<InformacaoRag[]>([])
    const isLoadingPrompt = ref(false)
    const isLoadingRag = ref(false)
    const isSavingPrompt = ref(false)
    const isAddingRag = ref(false)
    const isAddingFile = ref(false)

    // System Prompt Actions
    const fetchSystemPrompt = async () => {
        try {
            isLoadingPrompt.value = true
            const data = await $fetch<Readonly<SystemPrompt | null>>('/api/agente/prompt')
            // data may be null if there are no records yet
            systemPrompt.value = data ? { ...data } : null
        } catch (error) {
            console.error('Erro ao buscar system prompt', error)
            throw error
        } finally {
            isLoadingPrompt.value = false
        }
    }

    const updateSystemPrompt = async (promptText: string) => {
        if (systemPrompt.value?.prompt === promptText) return // No change

        try {
            isSavingPrompt.value = true
            const data = await $fetch<Readonly<SystemPrompt>>('/api/agente/prompt', {
                method: 'PUT',
                body: { prompt: promptText }
            })
            systemPrompt.value = { ...data }
        } catch (error) {
            console.error('Erro ao salvar system prompt', error)
            throw error
        } finally {
            isSavingPrompt.value = false
        }
    }

    // RAG Actions
    const fetchRagList = async () => {
        try {
            isLoadingRag.value = true
            const data = await $fetch<Readonly<InformacaoRag[]>>('/api/agente/rag')
            ragList.value = [...data]
        } catch (error) {
            console.error('Erro ao buscar lista de RAG', error)
            throw error
        } finally {
            isLoadingRag.value = false
        }
    }

    const addRagContent = async (content: string) => {
        try {
            isAddingRag.value = true
            const data = await $fetch<Readonly<InformacaoRag>>('/api/agente/rag', {
                method: 'POST',
                body: { content }
            })
            // Coloca no inicio da lista local ja que é ORDER BY created_at DESC (opcional mas bom para a UI)
            ragList.value.unshift({ ...data })
        } catch (error) {
            console.error('Erro ao adicionar conteudo RAG', error)
            throw error
        } finally {
            isAddingRag.value = false
        }
    }

    const addRagFile = async (file: File) => {
        try {
            isAddingFile.value = true
            const formData = new FormData()
            formData.append('file', file)

            await $fetch<{ success: boolean; message: string }>('/api/agente/rag-file', {
                method: 'POST',
                body: formData
            })
            // Como arquivos não vão mais para o Supabase,
            // não adicionamos o arquivo na ragList do lado cliente.
        } catch (error) {
            console.error('Erro ao fazer upload do arquivo RAG', error)
            throw error
        } finally {
            isAddingFile.value = false
        }
    }

    const deleteRagContent = async (id: number) => {
        try {
            await $fetch(`/api/agente/rag/${id}`, {
                method: 'DELETE'
            })
            ragList.value = ragList.value.filter(item => item.id !== id)
        } catch (error) {
            console.error('Erro ao deletar conteudo RAG', error)
            throw error
        }
    }

    return {
        systemPrompt,
        ragList,
        isLoadingPrompt,
        isLoadingRag,
        isSavingPrompt,
        isAddingRag,
        isAddingFile,
        fetchSystemPrompt,
        updateSystemPrompt,
        fetchRagList,
        addRagContent,
        addRagFile,
        deleteRagContent
    }
})
