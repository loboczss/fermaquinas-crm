import { defineStore } from 'pinia'
import type { Workspace } from '~/types/database.types'

export const useWorkspaceStore = defineStore('workspace', {
    state: () => ({
        workspaces: [] as Workspace[],
        loading: false,
        error: null as string | null
    }),

    actions: {
        async fetchWorkspaces() {
            this.loading = true
            this.error = null

            try {
                const data = await $fetch<{ workspaces: Workspace[] }>('/api/workspaces')
                this.workspaces = data.workspaces
            } catch (err: any) {
                this.error = err.data?.message || err.message || 'Erro ao carregar workspaces'
                console.error('[WorkspaceStore] Erro:', err)
            } finally {
                this.loading = false
            }
        },

        async createWorkspace(name: string, description?: string) {
            this.loading = true
            this.error = null

            try {
                const newWorkspace = await $fetch<Workspace>('/api/workspaces', {
                    method: 'POST',
                    body: { name, description }
                })

                // Atualiza o estado local imediatamente com o novo workspace
                this.workspaces.unshift(newWorkspace)
                return newWorkspace
            } catch (err: any) {
                this.error = err.data?.message || err.message || 'Erro ao criar workspace'
                console.error('[WorkspaceStore] Erro ao criar:', err)
                throw err
            } finally {
                this.loading = false
            }
        },

        async deleteWorkspace(id: number) {
            try {
                await $fetch(`/api/workspaces/${id}`, {
                    method: 'DELETE'
                })

                // Atualiza o estado local removendo o workspace
                this.workspaces = this.workspaces.filter(w => w.id !== id)
            } catch (err: any) {
                console.error('[WorkspaceStore] Erro ao deletar:', err)
                throw err
            }
        }
    }
})
