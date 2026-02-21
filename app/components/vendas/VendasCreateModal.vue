<script setup lang="ts">
import { ref, computed } from 'vue'
import { useVendasStore } from '~/stores/useVendasStore'
import { useCrmStore } from '~/stores/useCrmStore'
import BaseModal from '~/components/BaseModal.vue'
import BaseInput from '~/components/BaseInput.vue'
import BaseButton from '~/components/BaseButton.vue'

const store = useVendasStore()
const crmStore = useCrmStore()

const formData = ref({
  contato_id: '',
  contact_name: '',
  vendedor: '',
  valor_venda: 0,
  produtos: ''
})

const displayValor = ref('')

watch(displayValor, (newVal, oldVal) => {
  if (newVal === oldVal) return
  const digits = newVal.replace(/\D/g, '')
  if (!digits) {
    if (displayValor.value !== '') displayValor.value = ''
    formData.value.valor_venda = 0
    return
  }
  
  const num = parseInt(digits, 10) / 100
  formData.value.valor_venda = num
  const formatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num)
  
  if (displayValor.value !== formatted) {
    displayValor.value = formatted
  }
})

const clientSearchTerm = ref('')
const searchResults = ref<any[]>([])
const isSearching = ref(false)
let searchTimeout: any = null

watch(clientSearchTerm, (newTerm) => {
  // Ignora busca se o termo for o cliente já selecionado
  if (formData.value.contato_id && newTerm.includes(formData.value.contato_id)) {
    return
  }

  const term = newTerm.trim()
  if (term.length < 2) {
    searchResults.value = []
    return
  }

  isSearching.value = true
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(async () => {
    try {
      const client = useSupabaseClient()
      const { data, error } = await client
        .from('crm_fermaquinas')
        .select('id, contato_id, nome, nome_social')
        .is('deleted_at', null)
        .or(`nome.ilike.%${term}%,nome_social.ilike.%${term}%,contato_id.ilike.%${term}%`)
        .limit(10)
      
      if (!error && data) {
        searchResults.value = data
      }
    } catch (e) {
      console.error('Erro na busca de clientes:', e)
    } finally {
      isSearching.value = false
    }
  }, 400) // 400ms debounce
})

const filteredClientes = computed(() => {
  if (!clientSearchTerm.value) return crmStore.clientes.slice(0, 5) // Sugestões iniciais
  return searchResults.value
})

const selectClient = (c: any) => {
  formData.value.contato_id = c.contato_id
  formData.value.contact_name = c.nome || c.nome_social || ''
  clientSearchTerm.value = `${formData.value.contact_name} (${c.contato_id})`
  showDropdown.value = false
}

const showDropdown = ref(false)

const isSubmitting = ref(false)

const handleSave = async () => {
  if (!formData.value.contato_id || !formData.value.valor_venda) return
  
  isSubmitting.value = true
  try {
    // Acha o client_name via contato_id caso não tenha sido preenchido
    if (!formData.value.contact_name && formData.value.contato_id) {
      const c = crmStore.clientes.find(x => x.contato_id === formData.value.contato_id)
      if (c) formData.value.contact_name = c.nome || c.nome_social || ''
    }

    await store.criarVenda({
      contato_id: formData.value.contato_id,
      contact_name: formData.value.contact_name,
      valor_venda: Number(formData.value.valor_venda),
      produtos: formData.value.produtos,
      vendedor: formData.value.vendedor || undefined
    })
    
    // reset form
    formData.value = {
      contato_id: '',
      contact_name: '',
      vendedor: '',
      valor_venda: 0,
      produtos: ''
    }
    clientSearchTerm.value = ''
    displayValor.value = ''
  } finally {
    isSubmitting.value = false
  }
}

// Carregar contatos se vazio
onMounted(() => {
  if (crmStore.clientes.length === 0) {
    crmStore.fetchClientes()
  }
})
</script>

<template>
  <BaseModal
    v-model="store.isCreateModalOpen"
    title="Registrar Nova Venda"
    description="Vincule a venda a um cliente do CRM e defina os produtos e o valor."
  >
    <div class="space-y-5">
      <!-- Select Cliente (Combobox customizado) -->
      <div class="relative">
        <label class="block text-sm font-medium text-secondary-700 dark:text-dark-text mb-1">
          Cliente (Contato) <span class="text-red-500">*</span>
        </label>
         <div class="relative">
          <input
            v-model="clientSearchTerm"
            @focus="showDropdown = true"
            @input="() => { formData.contato_id = ''; showDropdown = true }"
            type="text"
            placeholder="Digite para buscar nome ou número..."
            class="block w-full rounded-xl border-secondary-300 dark:border-dark-border bg-white dark:bg-dark-surface text-secondary-900 dark:text-dark-text shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm h-10 px-3 transition-colors"
          />
          <ul
            v-if="showDropdown && (filteredClientes.length > 0 || isSearching)"
            class="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-xl bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-100 dark:border-gray-700"
          >
            <li v-if="isSearching" class="py-3 px-4 text-sm text-gray-500 text-center flex items-center justify-center gap-2">
              <svg class="animate-spin h-4 w-4 text-primary-500" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Buscando...
            </li>
            <li
              v-for="c in filteredClientes"
              :key="c.id"
              @mousedown.prevent="selectClient(c)"
              class="relative cursor-pointer select-none py-2 pl-3 pr-9 text-sm hover:bg-primary-50 dark:hover:bg-primary-900/20 text-gray-900 dark:text-gray-200 transition-colors border-b border-gray-50 dark:border-gray-700/50 last:border-0"
            >
              <div class="flex flex-col">
                <span class="font-medium truncate">{{ c.nome || c.nome_social || 'Cliente S/ Nome' }}</span>
                <span class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ c.contato_id }}</span>
              </div>
            </li>
          </ul>
           <div 
             v-else-if="showDropdown && clientSearchTerm !== '' && !isSearching" 
             class="absolute z-50 mt-1 w-full rounded-xl bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700 p-3 text-center text-sm text-gray-500"
            >
            Nenhum cliente encontrado.
          </div>
        </div>
      </div>
      
      <!-- Vendedor -->
      <BaseInput
        v-model="formData.vendedor"
        label="Vendedor Responsável (Opcional)"
        placeholder="Quem está realizando a venda?"
        type="text"
      />

      <!-- Valor -->
      <BaseInput
        v-model="displayValor"
        label="Valor da Venda (R$)"
        type="text"
        placeholder="R$ 0,00"
        required
      />

      <!-- Produtos -->
      <div>
        <label class="block text-sm font-medium text-secondary-700 dark:text-dark-text mb-1">
          Produtos/Serviços
        </label>
        <textarea
          v-model="formData.produtos"
          rows="3"
          class="block w-full rounded-xl border-secondary-300 dark:border-dark-border bg-white dark:bg-dark-surface text-secondary-900 dark:text-dark-text shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-3 transition-colors resize-none"
          placeholder="Ex: Furadeira Makita 12V, Parafusos..."
        ></textarea>
      </div>

      <!-- Actions -->
      <div class="mt-8 flex justify-end gap-3 pt-4 border-t border-secondary-200 dark:border-dark-border">
        <BaseButton
          variant="secondary"
          @click="store.fecharCriacao"
          :disabled="isSubmitting"
        >
          Cancelar
        </BaseButton>
        <BaseButton
          variant="primary"
          @click="handleSave"
          :loading="isSubmitting"
          :disabled="!formData.contato_id || !formData.valor_venda"
        >
          Salvar Venda
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>
