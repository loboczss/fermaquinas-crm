<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import type { ContatoResumo, Mensagem } from '~/stores/useChatDashboard'
import MessageBubble from '~/components/dashboard/MessageBubble.vue'

interface Props {
  isOpen: boolean
  contato: ContatoResumo | undefined
  mensagens: Mensagem[]
  loading: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'close'): void
}>()

const messagesContainer = ref<HTMLElement | null>(null)

// Rola para o final quando as mensagens mudam ou o modal abre
watch([() => props.mensagens, () => props.isOpen], async () => {
  if (props.isOpen && !props.loading && props.mensagens.length > 0) {
    await nextTick()
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  }
})

const getInitials = (name: string | null): string => {
  if (!name?.trim()) return 'NA'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'NA'
  const first = parts[0]
  const last = parts[parts.length - 1]
  
  if (!first) return 'NA'
  if (parts.length === 1) return first.substring(0, 2).toUpperCase()
  if (!last || !first[0] || !last[0]) return 'NA'
  
  return (first[0] + last[0]).toUpperCase()
}

const close = () => {
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <!-- Overlay Background -->
      <div 
        v-if="isOpen" 
        class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-gray-900/60 backdrop-blur-sm"
        @click.self="close"
      >
        <Transition name="slide-up">
          <!-- Modal Panel -->
          <div 
            v-if="isOpen"
            class="bg-gray-50 dark:bg-gray-900 w-full max-w-4xl h-[90vh] sm:h-[80vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden relative"
          >
            <!-- Header -->
            <div class="px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between z-10 shrink-0">
              <div class="flex items-center gap-4">
                <button 
                  @click="close"
                  class="p-2 -ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                  title="Voltar"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <div v-if="contato" class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold shadow-inner">
                    {{ getInitials(contato.contact_name) }}
                  </div>
                  <div>
                    <h3 class="text-base font-semibold text-gray-900 dark:text-white leading-tight">
                      {{ contato.contact_name || 'Nome Indisponível' }}
                    </h3>
                    <div class="flex items-center gap-1.5 mt-0.5">
                      <span class="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                      <span class="text-xs text-gray-500 dark:text-gray-400 font-medium">Chat Online</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="flex items-center gap-2">
                <span class="hidden sm:inline-block text-xs font-mono text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                  ID: #{{ contato?.contato_id }}
                </span>
                <button 
                  @click="close"
                  class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:bg-gray-800 transition md:hidden"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Pattern Background Fundo do Chat -->
            <div class="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style="background-image: url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"></div>

            <!-- Messages Area -->
            <div 
              ref="messagesContainer"
              class="flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth z-10"
            >
              <div v-if="loading" class="flex flex-col h-full items-center justify-center text-gray-400 gap-3">
                 <div class="flex gap-2">
                   <div class="w-2.5 h-2.5 bg-primary-500 rounded-full animate-bounce"></div>
                   <div class="w-2.5 h-2.5 bg-primary-500 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                   <div class="w-2.5 h-2.5 bg-primary-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                 </div>
                 <p class="text-sm font-medium">Carregando histórico...</p>
              </div>

              <div v-else-if="mensagens.length === 0" class="flex flex-col h-full items-center justify-center text-gray-400">
                <svg class="w-12 h-12 mb-3 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p class="text-sm font-medium">Nenhuma mensagem encontrada neste chat.</p>
              </div>

              <div v-else class="space-y-1 mx-auto max-w-3xl">
                <!-- Dia/Data mock para separar conversas (opcional) -->
                <div class="flex justify-center my-6">
                  <span class="bg-primary-50/80 dark:bg-gray-800 text-primary-600 dark:text-gray-400 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm shadow-sm border border-primary-100/50 dark:border-gray-700/50">
                    Histórico Completo
                  </span>
                </div>
                
                <MessageBubble 
                  v-for="msg in mensagens" 
                  :key="msg.id" 
                  :mensagem="msg" 
                />
              </div>
            </div>

            <!-- Footer / Input (Apenas visual por enquanto) -->
            <div class="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-800 z-10 shrink-0">
               <div class="max-w-3xl mx-auto flex items-end gap-3 rounded-2xl bg-gray-50/50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-primary-500/30 focus-within:border-primary-500 transition-all p-2">
                 <button class="p-2 text-gray-400 hover:text-primary-500 transition shrink-0 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800">
                   <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 </button>
                 <textarea 
                   rows="1" 
                   class="w-full bg-transparent border-none focus:ring-0 py-2.5 text-sm text-gray-700 dark:text-gray-200 resize-none max-h-32 placeholder-gray-400 disabled:opacity-50" 
                   placeholder="Digite uma mensagem... (Visual)"
                   disabled
                 ></textarea>
                 <button class="p-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition shadow-sm hover:shadow-md shrink-0 focus:outline-none focus:ring-2 focus:ring-primary-500/40">
                   <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                 </button>
               </div>
            </div>
          </div>
        </Transition>
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

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(40px) scale(0.98);
}
</style>
