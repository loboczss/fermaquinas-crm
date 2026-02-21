<script setup lang="ts">
import { useCrmStore } from '~/stores/useCrmStore'
import { formatClientName } from '~/utils/formatters'
import BadgeSentiment from './BadgeSentiment.vue'
import BadgeUrgency from './BadgeUrgency.vue'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
const store = useCrmStore()

const activeTab = ref('perfil') // 'perfil', 'vendas', 'mensagens'

const tabs = [
  { id: 'perfil', name: 'Perfil' },
  { id: 'vendas', name: 'Vendas' },
  { id: 'mensagens', name: 'Mensagens' }
]

const formatCurrency = (value: number | null) => {
  if (!value) return 'R$ 0,00'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

const formatarDataHora = (dateString: string | null) => {
  if (!dateString) return '-'
  try {
    return format(parseISO(dateString), "dd/MM/yyyy HH:mm")
  } catch {
    return dateString
  }
}

const formatarData = (dateString: string | null) => {
  if (!dateString) return '-'
  try {
    return format(parseISO(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
  } catch {
    return dateString
  }
}

const handleDeletar = async () => {
  if (!store.clienteSelecionado) return
  const confirmacao = confirm(`Tem certeza que deseja remover o cliente ${formatClientName(store.clienteSelecionado.nome, store.clienteSelecionado.nome_social)}?\nO histórico associado também deixará de aparecer.`)
  if (confirmacao) {
    await store.deletarCliente(store.clienteSelecionado.id)
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="store.clienteSelecionado" class="relative z-50 pointer-events-auto" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
        
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" @click="store.fecharDetalhes()"></div>

        <div class="fixed inset-0 overflow-hidden">
          <div class="absolute inset-0 overflow-hidden">
            <div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <Transition name="slide">
                <div v-if="store.clienteSelecionado" class="pointer-events-auto w-screen max-w-2xl transform transition ease-in-out duration-500 sm:duration-700">
                  <div class="flex h-full flex-col overflow-y-scroll bg-white dark:bg-gray-900 shadow-2xl">
                    <!-- Drawer Header -->
                    <div class="px-6 py-6 sm:px-8 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                      <div class="flex items-start justify-between">
                        <div class="flex gap-4 items-center">
                          <div class="h-16 w-16 rounded-2xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-600 dark:text-primary-400 text-2xl font-bold border border-primary-200 dark:border-primary-800 shadow-sm">
                            {{ formatClientName(store.clienteSelecionado.nome, store.clienteSelecionado.nome_social).substring(0, 2).toUpperCase() }}
                          </div>
                          <div>
                            <h2 class="text-2xl font-semibold leading-6 text-gray-900 dark:text-white" id="slide-over-title">
                              {{ formatClientName(store.clienteSelecionado.nome, store.clienteSelecionado.nome_social) }}
                            </h2>
                            <p class="mt-1.5 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 font-mono">
                              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              {{ store.clienteSelecionado.contato_id }}
                            </p>
                          </div>
                        </div>
                        <div class="ml-3 flex h-7 items-center gap-2">
                          <!-- Botão Editar -->
                          <button @click="store.abrirEdicao()" type="button" class="group flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/30 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500">
                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                            </svg>
                            Editar
                          </button>
                          
                          <!-- Botão Excluir -->
                          <button @click="handleDeletar" type="button" class="group flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500">
                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                            Excluir
                          </button>

                          <div class="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>

                          <button @click="store.fecharDetalhes()" type="button" class="relative rounded-lg p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500">
                            <span class="absolute -inset-2.5"></span>
                            <span class="sr-only">Close panel</span>
                            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      <!-- Quick Badges -->
                      <div class="mt-6 flex flex-wrap gap-3">
                        <BadgeSentiment :sentimento="store.clienteSelecionado.sentimento" />
                        <BadgeUrgency :urgencia="store.clienteSelecionado.urgencia" />
                        <span v-if="store.clienteSelecionado.fase_obra" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
                          <svg class="mr-1.5 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                          Obra: {{ store.clienteSelecionado.fase_obra }}
                        </span>
                      </div>
                    </div>

                    <!-- Tabs Navigation -->
                    <div class="px-6 sm:px-8 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                      <nav class="-mb-px flex space-x-8" aria-label="Tabs">
                        <button
                          v-for="tab in tabs"
                          :key="tab.id"
                          @click="activeTab = tab.id"
                          :class="[
                            activeTab === tab.id
                              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-200',
                            'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors'
                          ]"
                        >
                          {{ tab.name }}
                        </button>
                      </nav>
                    </div>

                    <!-- Drawer Content -->
                    <div class="flex-1 px-6 py-8 sm:px-8 text-sm overflow-y-auto">
                      <!-- Aba: Perfil -->
                      <dl v-if="activeTab === 'perfil'" class="space-y-8 sm:space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <!-- Info Grid -->
                        <div class="grid grid-cols-2 gap-6 sm:gap-8 bg-gray-50/50 dark:bg-gray-800/30 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
                          <div>
                            <dt class="font-medium text-gray-500 dark:text-gray-400">Email</dt>
                            <dd class="mt-1 text-gray-900 dark:text-white">{{ store.clienteSelecionado.email || '-' }}</dd>
                          </div>
                          <div>
                            <dt class="font-medium text-gray-500 dark:text-gray-400">Cidade</dt>
                            <dd class="mt-1 text-gray-900 dark:text-white">{{ store.clienteSelecionado.cidade || '-' }}</dd>
                          </div>
                          <div>
                            <dt class="font-medium text-gray-500 dark:text-gray-400">Data de Nascimento</dt>
                            <dd class="mt-1 text-gray-900 dark:text-white">{{ formatarData(store.clienteSelecionado.data_nascimento) }}</dd>
                          </div>
                          <div>
                            <dt class="font-medium text-gray-500 dark:text-gray-400">Data de Cadastro</dt>
                            <dd class="mt-1 text-gray-900 dark:text-white">{{ formatarData(store.clienteSelecionado.created_at) }}</dd>
                          </div>
                        </div>

                        <!-- Rich Text Blocks -->
                        <div>
                          <dt class="flex items-center gap-2 font-semibold text-lg text-gray-900 dark:text-white mb-3">
                            <span class="p-1.5 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            </span>
                            Resumo do Perfil
                          </dt>
                          <dd class="mt-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm leading-relaxed whitespace-pre-line">
                            {{ store.clienteSelecionado.resumo_perfil || 'Não há resumo registrado para este cliente.' }}
                          </dd>
                        </div>

                        <div>
                          <dt class="flex items-center gap-2 font-semibold text-lg text-gray-900 dark:text-white mb-3">
                            <span class="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                            </span>
                            Interesses
                          </dt>
                          <dd class="mt-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm leading-relaxed whitespace-pre-line">
                            {{ store.clienteSelecionado.interesses || 'Nenhum interesse registrado.' }}
                          </dd>
                        </div>

                        <div>
                          <dt class="flex items-center gap-2 font-semibold text-lg text-gray-900 dark:text-white mb-3">
                            <span class="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            </span>
                            Objeções
                          </dt>
                          <dd class="mt-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm leading-relaxed whitespace-pre-line">
                            {{ store.clienteSelecionado.objeccoes || 'Nenhuma objeção registrada.' }}
                          </dd>
                        </div>
                      </dl>

                      <!-- Aba: Vendas -->
                      <div v-else-if="activeTab === 'vendas'" class="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div class="mb-5 flex items-center justify-between bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-800/50">
                          <div>
                            <p class="text-xs font-semibold uppercase tracking-wider text-green-700 dark:text-green-400">Total Gasto</p>
                            <p class="text-2xl font-bold text-green-700 dark:text-green-300">
                              {{ formatCurrency(store.clienteVendas.reduce((acc, v) => acc + (v.valor_venda || 0), 0)) }}
                            </p>
                          </div>
                          <div class="text-right">
                            <p class="text-xs font-semibold uppercase tracking-wider text-green-700 dark:text-green-400">Volume</p>
                            <p class="text-2xl font-bold text-green-700 dark:text-green-300">
                              {{ store.clienteVendas.length }} <span class="text-sm font-normal">venda(s)</span>
                            </p>
                          </div>
                        </div>

                        <div v-if="store.clienteVendas.length === 0" class="text-center py-10 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                          <p class="text-gray-500 dark:text-gray-400">Nenhuma venda registrada para este cliente.</p>
                        </div>

                        <div v-else class="space-y-4">
                          <div v-for="venda in store.clienteVendas" :key="venda.id" class="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                            <div class="flex justify-between items-start mb-2">
                              <div>
                                <p class="text-xs text-gray-500 dark:text-gray-400">{{ formatarDataHora(venda.created_at) }}</p>
                                <p class="text-sm font-medium mt-0.5 text-gray-900 dark:text-white" :title="venda.produtos || ''">{{ venda.produtos || 'Sem detalhes' }}</p>
                              </div>
                              <span class="font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-md text-sm">
                                {{ formatCurrency(venda.valor_venda) }}
                              </span>
                            </div>
                            <div class="flex justify-between items-center mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50">
                              <span class="text-xs text-gray-400">ID: {{ venda.id }}</span>
                              <span class="text-xs font-medium text-gray-500 dark:text-gray-400"><span class="font-normal text-gray-400 mr-1">Vendedor:</span> {{ venda.vendedor || '-' }}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Aba: Mensagens -->
                      <div v-else-if="activeTab === 'mensagens'" class="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div v-if="store.clienteMensagens.length === 0" class="text-center py-10 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                          <p class="text-gray-500 dark:text-gray-400">Nenhuma mensagem encontrada.</p>
                        </div>
                        
                        <div v-else class="relative border-l-2 border-gray-200 dark:border-gray-800 ml-3 space-y-6 pb-4">
                          <div v-for="msg in store.clienteMensagens" :key="msg.id" class="relative pl-6">
                            <!-- Indicator -->
                            <div class="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white dark:border-gray-900" :class="msg.sender_type === 'user' ? 'bg-primary-500' : 'bg-gray-400 dark:bg-gray-600'"></div>
                            
                            <div class="bg-gray-50 dark:bg-gray-800 p-3.5 rounded-xl rounded-tl-none shadow-sm border border-gray-100 dark:border-gray-700 relative">
                              <div class="flex items-center justify-between mb-1.5 gap-4">
                                <span class="font-semibold text-xs truncate" :class="msg.sender_type === 'user' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'">
                                  {{ msg.sender_type === 'user' ? 'Atendente' : 'Cliente' }}
                                </span>
                                <span class="text-[10px] text-gray-400 shrink-0">{{ formatarDataHora(msg.created_at) }}</span>
                              </div>
                              <p class="text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed">{{ msg.mensagem }}</p>
                            </div>
                          </div>
                          
                          <div v-if="store.clienteMensagens.length === 20" class="pl-6 pt-4 text-xs font-medium text-gray-400 text-center italic">
                            Mostrando as últimas 20 mensagens...
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Transition>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
