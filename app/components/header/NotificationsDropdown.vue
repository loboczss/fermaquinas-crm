<script setup lang="ts">
import { ref, computed } from 'vue'

interface Notification {
  id: number
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  time: string
  read: boolean
}

const notifications = ref<Notification[]>([
  {
    id: 1,
    type: 'success',
    title: 'Nova venda realizada',
    message: 'Você fechou uma venda de R$ 2.500,00',
    time: '5 min atrás',
    read: false
  },
  {
    id: 2,
    type: 'info',
    title: 'Novo atendimento',
    message: 'Cliente João Silva iniciou um atendimento',
    time: '15 min atrás',
    read: false
  },
  {
    id: 3,
    type: 'warning',
    title: 'Reunião agendada',
    message: 'Reunião com cliente às 15:00',
    time: '1 hora atrás',
    read: false
  },
  {
    id: 4,
    type: 'info',
    title: 'Atualização do sistema',
    message: 'Nova funcionalidade disponível no CRM',
    time: '2 horas atrás',
    read: true
  },
  {
    id: 5,
    type: 'success',
    title: 'Meta atingida',
    message: 'Você atingiu 80% da meta mensal',
    time: '1 dia atrás',
    read: true
  }
])

const isOpen = ref(false)

const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

const toggle = () => {
  isOpen.value = !isOpen.value
}

const close = () => {
  isOpen.value = false
}

const markAsRead = (id: number) => {
  const notification = notifications.value.find(n => n.id === id)
  if (notification) {
    notification.read = true
  }
}

const markAllAsRead = () => {
  notifications.value.forEach(n => n.read = true)
}

const getTypeColor = (type: string) => {
  const colors = {
    info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    success: 'bg-success-100 dark:bg-success-900/30 text-success-600 dark:text-success-400',
    warning: 'bg-warning-100 dark:bg-warning-900/30 text-warning-600 dark:text-warning-400',
    error: 'bg-danger-100 dark:bg-danger-900/30 text-danger-600 dark:text-danger-400'
  }
  return colors[type as keyof typeof colors] || colors.info
}

const getTypeIcon = (type: string) => {
  const icons = {
    info: 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z',
    success: 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z',
    warning: 'M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z',
    error: 'M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
  }
  return icons[type as keyof typeof icons] || icons.info
}
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
      <span 
        v-if="unreadCount > 0" 
        class="absolute -top-1 -right-1 min-w-[1.25rem] h-5 px-1 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-dark-surface"
      >
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </span>
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
        class="absolute right-0 mt-2 w-96 bg-white dark:bg-dark-surface rounded-2xl shadow-xl shadow-black/10 dark:shadow-black/40 border border-secondary-100 dark:border-dark-border overflow-hidden z-50"
      >
        <!-- Header -->
        <div class="px-4 py-3 border-b border-secondary-100 dark:border-dark-border flex items-center justify-between">
          <h3 class="text-lg font-bold text-secondary-900 dark:text-dark-text">
            Notificações
          </h3>
          <button 
            v-if="unreadCount > 0"
            @click="markAllAsRead"
            class="text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
          >
            Marcar todas como lidas
          </button>
        </div>

        <!-- Notificações List -->
        <div class="max-h-[400px] overflow-y-auto">
          <div 
            v-for="notification in notifications" 
            :key="notification.id"
            @click="markAsRead(notification.id)"
            class="px-4 py-3 hover:bg-secondary-50 dark:hover:bg-dark-bg cursor-pointer transition-all duration-200 hover:translate-x-0.5 border-b border-secondary-100 dark:border-dark-border last:border-b-0"
            :class="{'bg-primary-50/30 dark:bg-primary-900/10': !notification.read}"
          >
            <div class="flex gap-3">
              <!-- Icon -->
              <div class="flex-shrink-0">
                <div :class="[getTypeColor(notification.type), 'w-10 h-10 rounded-full flex items-center justify-center']">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" :d="getTypeIcon(notification.type)" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2">
                  <h4 class="text-sm font-semibold text-secondary-900 dark:text-dark-text">
                    {{ notification.title }}
                  </h4>
                  <span 
                    v-if="!notification.read" 
                    class="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-1"
                  ></span>
                </div>
                <p class="text-sm text-secondary-600 dark:text-secondary-400 mt-1">
                  {{ notification.message }}
                </p>
                <p class="text-xs text-secondary-500 dark:text-secondary-500 mt-2">
                  {{ notification.time }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-4 py-3 bg-secondary-50 dark:bg-dark-bg border-t border-secondary-100 dark:border-dark-border">
          <NuxtLink 
            to="/notificacoes" 
            @click="close"
            class="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors flex items-center justify-center gap-1"
          >
            Ver todas as notificações
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
          </NuxtLink>
        </div>
      </div>
    </transition>
  </div>
</template>
