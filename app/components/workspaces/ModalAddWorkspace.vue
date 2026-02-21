<script setup lang="ts">
import { ref } from 'vue'
import BaseModal from '~/components/BaseModal.vue'
import BaseInput from '~/components/BaseInput.vue'
import BaseButton from '~/components/BaseButton.vue'
import { useWorkspaceStore } from '~/stores/workspaces'
import { useToast } from '~/composables/useToast'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits(['update:modelValue', 'submit'])

const form = ref({
  name: '',
  description: ''
})

const isSubmitting = ref(false)
const workspaceStore = useWorkspaceStore()
const toast = useToast()

const close = () => {
  emit('update:modelValue', false)
  // Reset form after animation
  setTimeout(() => {
    form.value.name = ''
    form.value.description = ''
  }, 300)
}

const submit = async () => {
  if (!form.value.name.trim()) return

  isSubmitting.value = true
  
  try {
    const newWorkspace = await workspaceStore.createWorkspace(
      form.value.name, 
      form.value.description
    )
    toast.success('Workspace Criado', `O workspace '${newWorkspace.nome}' foi criado com sucesso!`)
    emit('submit', newWorkspace)
    close()
  } catch (err: any) {
    console.error('Falha ao criar workspace', err)
    toast.error('Erro na Criação', err.data?.message || err.message || 'Houve um erro ao tentar criar o workspace.')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <BaseModal 
    :model-value="modelValue" 
    @update:model-value="close"
    title="Novo Workspace" 
    description="Crie um novo ambiente de trabalho para organizar seus projetos e equipes de forma separada."
  >
    <!-- Custom Icon -->
    <template #icon>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    </template>

    <!-- Form Content -->
    <form @submit.prevent="submit" class="space-y-5 px-1 pb-2">
      <BaseInput
        v-model="form.name"
        label="Nome do Workspace"
        placeholder="Ex: Departamento Comercial"
        required
      />

      <div class="flex flex-col gap-1.5 w-full">
        <label class="text-sm font-medium text-secondary-700 dark:text-secondary-300">
          Descrição (Opcional)
        </label>
        <textarea
          v-model="form.description"
          rows="3"
          placeholder="Breve descrição do propósito deste workspace..."
          class="w-full px-4 py-2.5 rounded-xl border transition-all duration-300 outline-none bg-white dark:bg-dark-surface text-secondary-900 dark:text-dark-text border-secondary-200 dark:border-dark-border focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 dark:focus:ring-primary-500/5 resize-none shadow-sm"
        ></textarea>
      </div>

      <!-- Hidden submit button to allow Enter key submission inside the form -->
      <button type="submit" class="hidden"></button>
    </form>

    <!-- Action Buttons -->
    <template #footer>
      <BaseButton 
        type="button" 
        variant="secondary" 
        class="w-full sm:w-auto" 
        @click="close"
        :disabled="isSubmitting"
      >
        Cancelar
      </BaseButton>
      <BaseButton 
        type="button" 
        variant="primary" 
        class="w-full sm:w-auto" 
        :loading="isSubmitting"
        @click="submit"
        :disabled="!form.name.trim()"
      >
        <span>Criar Workspace</span>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1.5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </BaseButton>
    </template>
  </BaseModal>
</template>
