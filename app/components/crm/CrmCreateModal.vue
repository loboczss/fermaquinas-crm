<script setup lang="ts">
import { ref, watch } from 'vue'
import { useCrmStore } from '~/stores/useCrmStore'

const store = useCrmStore()

const isSubmitting = ref(false)

// Formulário reativo para criação
const formData = ref({
  contato_id: '',
  nome: '',
  nome_social: '',
  email: '',
  cidade: '',
  data_nascimento: '',
  fase_obra: '',
  sentimento: 'Neutro',
  urgencia: 'Baixa'
})

// Reseta o formulário quando abrir
watch(() => store.isCreateModalOpen, (isOpen) => {
  if (isOpen) {
    formData.value = {
      contato_id: '',
      nome: '',
      nome_social: '',
      email: '',
      cidade: '',
      data_nascimento: '',
      fase_obra: '',
      sentimento: 'Neutro',
      urgencia: 'Baixa'
    }
  }
})

const handleSave = async () => {
  if (!formData.value.contato_id || formData.value.contato_id.trim() === '') {
    const { useToast } = await import('~/composables/useToast')
    const toast = useToast()
    toast.error('O ID de Contato / Telefone é obrigatório.')
    return
  }

  isSubmitting.value = true
  await store.adicionarCliente(formData.value)
  isSubmitting.value = false
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="store.isCreateModalOpen" class="relative z-[60]" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" @click="!isSubmitting && store.fecharCriacao()"></div>

        <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition name="modal">
              <div v-if="store.isCreateModalOpen" class="relative transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl border border-gray-100 dark:border-gray-800">
                
                <!-- Modal Header -->
                <div class="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <h3 class="text-lg font-semibold leading-6 text-gray-900 dark:text-white" id="modal-title">
                    Novo Cliente
                  </h3>
                  <button @click="store.fecharCriacao()" :disabled="isSubmitting" class="text-gray-400 hover:text-gray-500 focus:outline-none">
                    <span class="sr-only">Fechar</span>
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <!-- Form Content -->
                <form @submit.prevent="handleSave" class="px-6 py-6 sm:p-8">
                  <div class="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
                    
                    <!-- REQUIRED Contato ID -->
                    <div class="sm:col-span-2">
                      <label class="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
                        Telefone / ID WhatsApp <span class="text-red-500">*</span>
                      </label>
                      <div class="mt-2">
                        <input 
                          v-model="formData.contato_id"
                          type="text" 
                          placeholder="+55 11 99999-9999"
                          required
                          class="block w-full rounded-xl border-0 py-2.5 px-3 text-gray-900 dark:text-white dark:bg-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 transition-shadow"
                        >
                        <p class="mt-1.5 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <svg class="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Deve ser único. Exemplo de formato: +5511999999999
                        </p>
                      </div>
                    </div>

                    <!-- Nome -->
                    <div>
                      <label class="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">Nome</label>
                      <div class="mt-2">
                        <input v-model="formData.nome" type="text" class="block w-full rounded-xl border-0 py-2.5 px-3 text-gray-900 dark:text-white dark:bg-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 transition-shadow">
                      </div>
                    </div>

                    <!-- Nome Social -->
                    <div>
                      <label class="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">Nome Social</label>
                      <div class="mt-2">
                        <input v-model="formData.nome_social" type="text" class="block w-full rounded-xl border-0 py-2.5 px-3 text-gray-900 dark:text-white dark:bg-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 transition-shadow">
                      </div>
                    </div>

                    <!-- Email -->
                    <div>
                      <label class="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">Email</label>
                      <div class="mt-2">
                        <input v-model="formData.email" type="email" class="block w-full rounded-xl border-0 py-2.5 px-3 text-gray-900 dark:text-white dark:bg-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 transition-shadow">
                      </div>
                    </div>

                    <!-- Data Nascimento -->
                    <div>
                      <label class="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">Data de Nascimento</label>
                      <div class="mt-2">
                        <input v-model="formData.data_nascimento" type="date" class="block w-full rounded-xl border-0 py-2.5 px-3 text-gray-900 dark:text-white dark:bg-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 transition-shadow">
                      </div>
                    </div>

                    <!-- Cidade -->
                    <div class="sm:col-span-2">
                      <label class="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">Cidade</label>
                      <div class="mt-2">
                        <input v-model="formData.cidade" type="text" class="block w-full rounded-xl border-0 py-2.5 px-3 text-gray-900 dark:text-white dark:bg-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 transition-shadow">
                      </div>
                    </div>

                    <!-- Fase Obra -->
                    <div>
                      <label class="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">Fase da Obra</label>
                      <div class="mt-2">
                        <select v-model="formData.fase_obra" class="block w-full rounded-xl border-0 py-2.5 px-3 text-gray-900 dark:text-white dark:bg-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 transition-shadow">
                          <option value="">Selecione...</option>
                          <option value="Construção">Construção</option>
                          <option value="Reforma">Reforma</option>
                          <option value="Reparo">Reparo</option>
                          <option value="Orçamento">Orçamento</option>
                          <option value="Indefinido">Indefinido</option>
                        </select>
                      </div>
                    </div>

                    <!-- Sentimento -->
                    <div>
                      <label class="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">Sentimento</label>
                      <div class="mt-2">
                        <select v-model="formData.sentimento" class="block w-full rounded-xl border-0 py-2.5 px-3 text-gray-900 dark:text-white dark:bg-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 transition-shadow">
                          <option value="">Selecione...</option>
                          <option value="Positivo">Positivo</option>
                          <option value="Neutro">Neutro</option>
                          <option value="Negativo">Negativo</option>
                          <option value="Urgente">Urgente</option>
                        </select>
                      </div>
                    </div>

                    <!-- Urgencia -->
                    <div>
                      <label class="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">Urgência</label>
                      <div class="mt-2">
                        <select v-model="formData.urgencia" class="block w-full rounded-xl border-0 py-2.5 px-3 text-gray-900 dark:text-white dark:bg-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 transition-shadow">
                          <option value="">Selecione...</option>
                          <option value="Baixa">Baixa</option>
                          <option value="Média">Média</option>
                          <option value="Alta">Alta</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <!-- Actions -->
                  <div class="mt-8 flex items-center justify-end gap-x-4 border-t border-gray-100 dark:border-gray-800 pt-6">
                    <button 
                      type="button" 
                      @click="store.fecharCriacao()" 
                      :disabled="isSubmitting"
                      class="text-sm font-semibold leading-6 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      :disabled="isSubmitting"
                      class="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      <svg v-if="isSubmitting" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Cadastrar Cliente
                    </button>
                  </div>
                </form>

              </div>
            </Transition>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.modal-enter-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.modal-leave-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}
</style>
