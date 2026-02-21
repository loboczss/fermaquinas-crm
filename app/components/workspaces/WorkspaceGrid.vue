<script setup lang="ts">
import WorkspaceCard from '~/components/workspaces/WorkspaceCard.vue'
import WorkspaceCardAdd from '~/components/workspaces/WorkspaceCardAdd.vue'

import type { Workspace } from '~/types/database.types'

interface Props {
  workspaces: Workspace[]
}

defineProps<Props>()

const emit = defineEmits<{
  add: []
  delete: [id: number]
}>()
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 xl:gap-8 pt-4">
    <!-- Card de adicionar sempre em primeiro -->
    <div class="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <WorkspaceCardAdd @click="emit('add')" />
    </div>

    <!-- Cards de workspaces existentes -->
    <div
      v-for="(workspace, index) in workspaces"
      :key="workspace.id"
      class="animate-in fade-in slide-in-from-bottom-2 duration-300"
      :style="{ animationDelay: `${(index + 1) * 60}ms` }"
    >
      <WorkspaceCard
        :id="workspace.id"
        :nome="workspace.nome"
        :descricao="workspace.descricao"
        :created-at="workspace.created_at"
        :avatar="workspace.avatar"
        @delete="emit('delete', $event)"
      />
    </div>
  </div>
</template>
