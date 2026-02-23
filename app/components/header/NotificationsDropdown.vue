<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useNotificacoesStore } from '~/stores/useNotificacoesStore'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const store = useNotificacoesStore()
const isOpen = ref(false)

const formatTime = (dateString: string) => {
  try {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true, locale: ptBR })
  } catch {
    return dateString
  }
}

const toggle = async () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    // Busca novamente para garantir atualizações quando abre
    await store.fetchNotificacoes()
  }
}

const close = () => {
  isOpen.value = false
}

const markAsRead = async (id: number) => {
  await store.marcarComoLida([id])
}

const markAllAsRead = async () => {
  await store.marcarTodasComoLidas()
}

const getTypeColor = (tipo: string) => {
  if (tipo === 'venda') return 'bg-success-100 dark:bg-success-900/30 text-success-600 dark:text-success-400'
  if (tipo === 'aniversario') return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
  if (tipo === 'novo_cliente') return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
  return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
}

const getTypeIcon = (tipo: string) => {
  if (tipo === 'venda') return 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' // Cart icon
  if (tipo === 'aniversario') return 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' // Clock minimal
  if (tipo === 'novo_cliente') return 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z' // User icon
  return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
}

// Fechar ao pressionar ESC
onMounted(() => {
  const handleEsc = (e: KeyboardEvent) => {
    if (e.key === 'Escape') close()
  }
  window.addEventListener('keydown', handleEsc)
  onUnmounted(() => window.removeEventListener('keydown', handleEsc))
})
</script>

<template>
  <div class="relative">
    <!-- Trigger Button -->
    <button 
      @click="toggle"
      class="relative p-2 rounded-full border border-transparent hover:border-secondary-200 dark:hover:border-dark-border hover:bg-secondary-50 dark:hover:bg-dark-bg transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-secondary-600 dark:text-secondary-400" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
      </svg>
      
      <!-- Badge de notificações não lidas -->
      <ClientOnly>
        <span 
          v-if="store.totalNaoLidas > 0" 
          class="absolute -top-1 -right-1 min-w-[1.25rem] h-5 px-1 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-dark-surface shadow-sm"
        >
          {{ store.totalNaoLidas > 9 ? '9+' : store.totalNaoLidas }}
        </span>
      </ClientOnly>
    </button>

    <!-- Invisible Overlay -->
    <div v-if="isOpen" @click="close" class="fixed inset-0 z-40"></div>

    <!-- Dropdown Menu -->
    <transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="transform opacity-0 scale-95 -translate-y-2"
      enter-to-class="transform opacity-100 scale-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="transform opacity-100 scale-100 translate-y-0"
      leave-to-class="transform opacity-0 scale-95 -translate-y-2"
    >
      <div 
        v-if="isOpen" 
        class="fixed inset-x-4 top-[70px] sm:absolute sm:inset-auto sm:right-0 sm:mt-2 sm:w-80 md:w-96 bg-white dark:bg-dark-surface rounded-2xl shadow-xl shadow-black/10 dark:shadow-black/40 border border-secondary-100 dark:border-dark-border overflow-hidden z-50 text-left"
      >
        <!-- Header -->
        <div class="px-4 py-3 border-b border-secondary-100 dark:border-dark-border flex items-center justify-between">
          <h3 class="text-lg font-bold text-secondary-900 dark:text-dark-text">
            Notificações
          </h3>
          <button 
            v-if="store.totalNaoLidas > 0"
            @click="markAllAsRead"
            class="text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
          >
            Marcar todas como lidas
          </button>
        </div>

        <!-- Notificações List -->
        <div class="max-h-[400px] overflow-y-auto w-full relative">
          <!-- Loading overlay -->
          <div v-if="store.loading && store.notificacoes.length === 0" class="flex flex-col items-center justify-center py-10">
            <svg class="animate-spin h-6 w-6 text-primary-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <span class="text-sm text-gray-500">Carregando...</span>
          </div>

          <!-- Empty State -->
          <div v-else-if="store.notificacoes.length === 0" class="px-4 py-10 text-center">
             <div class="mx-auto w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
               </svg>
             </div>
             <p class="text-sm text-gray-500 dark:text-gray-400">Nenhuma notificação no momento.</p>
          </div>

          <!-- List -->
          <template v-else>
            <div 
              v-for="notification in store.notificacoes" 
              :key="notification.id"
              @click="markAsRead(notification.id)"
              class="px-4 py-3 hover:bg-secondary-50 dark:hover:bg-dark-bg cursor-pointer transition-all duration-200 border-b border-secondary-100 dark:border-dark-border last:border-b-0 group"
              :class="!notification.lida ? 'bg-primary-50/40 dark:bg-primary-900/10 border-l-4 border-l-primary-500' : 'bg-transparent border-l-4 border-l-transparent opacity-90'"
            >
              <div class="flex gap-3">
                <!-- Icon -->
                <div class="flex-shrink-0 mt-0.5">
                  <div :class="[getTypeColor(notification.tipo), 'w-8 h-8 rounded-full flex items-center justify-center']">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getTypeIcon(notification.tipo)" />
                    </svg>
                  </div>
                </div>

                <!-- Content -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-2">
                    <h4 class="text-sm font-semibold text-secondary-900 dark:text-dark-text group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {{ notification.titulo }}
                    </h4>
                    <span 
                      v-if="!notification.lida" 
                      class="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-1"
                    ></span>
                  </div>
                  <p class="text-[13px] text-secondary-600 dark:text-secondary-400 mt-0.5 leading-snug">
                    {{ notification.mensagem }}
                  </p>
                  <p class="text-[11px] font-medium text-secondary-400 dark:text-secondary-500 mt-1.5 flex items-center gap-1">
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {{ formatTime(notification.created_at) }}
                  </p>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- Footer -->
        <div class="px-4 py-2.5 bg-secondary-50 dark:bg-dark-bg border-t border-secondary-100 dark:border-dark-border flex justify-center">
          <span class="text-xs text-gray-400 font-medium">Você está atualizado!</span>
        </div>
      </div>
    </transition>
  </div>
</template>
