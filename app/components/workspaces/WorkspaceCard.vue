<script setup lang="ts">
interface Props {
  id: number
  nome: string
  descricao: string | null
  createdAt: string
  avatar?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  delete: [id: number]
}>()

const initials = computed(() => {
  if (!props.nome) return '?'
  return props.nome
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()
})

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// Gera cor do avatar baseada no nome para consistência visual
const avatarColors = [
  'bg-primary-500',
  'bg-info-500',
  'bg-success-500',
  'bg-warning-500',
  'bg-danger-500',
]

const avatarColor = computed(() => {
  if (!props.nome) return avatarColors[0]
  const index = props.nome.charCodeAt(0) % avatarColors.length
  return avatarColors[index]
})
</script>

<template>
  <div class="group relative flex flex-col p-6 rounded-2xl bg-white dark:bg-dark-surface border border-secondary-100 dark:border-dark-border hover:border-secondary-300 dark:hover:border-secondary-700 shadow-sm hover:shadow-premium transition-all duration-300 cursor-pointer h-full min-h-[220px]">
    <!-- Top section: Avatar and Options -->
    <div class="flex items-start justify-between mb-4">
      <div v-if="!avatar" :class="[avatarColor, 'w-12 h-12 rounded-xl flex items-center justify-center text-white text-base font-semibold shadow-sm ring-4 ring-white dark:ring-dark-surface']">
        {{ initials }}
      </div>
      <img v-else :src="avatar" :alt="nome" class="w-12 h-12 rounded-xl object-cover shadow-sm ring-4 ring-white dark:ring-dark-surface" />
      
      <!-- Default Delete Icon -->
      <button 
        type="button"
        class="p-2 text-danger-400 hover:text-danger-600 dark:hover:text-danger-400 rounded-lg hover:bg-danger-50 dark:hover:bg-danger-900/30 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 outline-none"
        @click.stop="emit('delete', id)"
        title="Excluir Workspace"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 6h18"></path>
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
      </button>
    </div>

    <!-- Content section -->
    <div class="flex-1">
      <h3 class="font-semibold text-lg text-secondary-900 dark:text-dark-text mb-1.5 line-clamp-1 title-font">
        {{ nome }}
      </h3>
      <p class="text-sm text-secondary-500 dark:text-secondary-400 line-clamp-2 leading-relaxed">
        {{ descricao || 'Sem descrição definida para este workspace.' }}
      </p>
    </div>

    <!-- Footer section -->
    <div class="mt-6 flex items-center gap-2 pt-4 border-t border-secondary-50 dark:border-dark-border/40 text-xs text-secondary-400 dark:text-secondary-500 font-medium tracking-wide w-full">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
      Criado em {{ formatDate(createdAt) }}
    </div>
  </div>
</template>

<style scoped>
.title-font {
  letter-spacing: -0.01em;
}
</style>
