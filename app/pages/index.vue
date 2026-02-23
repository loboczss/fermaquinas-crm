<script setup lang="ts">
// Redireciona imediatamente para o dashboard
navigateTo('/dashboard', { replace: true })

definePageMeta({
  middleware: [
    function (to, from) {
      return navigateTo('/dashboard', { replace: true })
    }
  ]
})

import WorkspaceGrid from '~/components/workspaces/WorkspaceGrid.vue'
import ModalAddWorkspace from '~/components/workspaces/ModalAddWorkspace.vue'
import { ref, onMounted } from 'vue'
import { useWorkspaceStore } from '~/stores/workspaces'
import { useToast } from '~/composables/useToast'

useHead({
  title: 'Workspaces',
  meta: [
    { name: 'description', content: 'Gerencie seus workspaces' }
  ]
})

const workspaceStore = useWorkspaceStore()

onMounted(() => {
  // workspaceStore.fetchWorkspaces() // Desativado
})

const isAddModalOpen = ref(false)

const handleAddWorkspace = () => {
  isAddModalOpen.value = true
}

const toast = useToast()

const onWorkspaceAdded = (data: any) => {
  console.log('Novo workspace criado com sucesso no banco de dados:', data)
}

const handleDeleteWorkspace = async (id: number) => {
  if (!confirm('Tem certeza que deseja excluir este workspace?')) return

  try {
    await workspaceStore.deleteWorkspace(id)
    toast.error('Workspace excluído', 'O workspace foi removido com sucesso.')
  } catch (err: any) {
    toast.error('Erro na exclusão', err.data?.message || err.message || 'Não foi possível excluir o workspace.')
  }
}
</script>

<template>
  <div class="min-h-screen bg-secondary-50/30 dark:bg-dark-bg transition-colors duration-300">
    <!-- Page Header (Minimalist) -->
    <div class="pt-10 pb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-secondary-900 dark:text-dark-text">
          Meus Workspaces
        </h1>
        <p class="text-sm text-secondary-500 dark:text-secondary-400 mt-2 max-w-2xl leading-relaxed">
          Organize seus projetos, equipes e integrações em ambientes de trabalho isolados.
        </p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <div v-if="workspaceStore.loading" class="flex justify-center p-8">
        <div class="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin"></div>
      </div>
      <div v-else-if="workspaceStore.error" class="bg-danger-50 dark:bg-danger-900/10 border border-danger-200 dark:border-danger-900/30 text-danger-700 dark:text-danger-400 p-4 rounded-xl text-sm">
        {{ workspaceStore.error }}
      </div>
      <WorkspaceGrid
        v-else
        :workspaces="workspaceStore.workspaces"
        @add="handleAddWorkspace"
        @delete="handleDeleteWorkspace"
      />
    </div>

    <!-- Modals -->
    <ModalAddWorkspace 
      v-model="isAddModalOpen"
      @submit="onWorkspaceAdded"
    />
  </div>
</template>
