<script setup lang="ts">
import { useToast } from '~/composables/useToast'

const { toasts, removeToast } = useToast()

const getIcon = (type: string) => {
  switch (type) {
    case 'success':
      return `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>`
    case 'danger':
      return `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>`
    case 'warning':
      return `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>`
    case 'info':
    default:
      return `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`
  }
}

const getColorClasses = (type: string) => {
  switch (type) {
    case 'success':
      return 'bg-success-50 border-success-300 text-success-800 dark:bg-success-950 dark:border-success-800 dark:text-success-200'
    case 'danger':
      return 'bg-danger-50 border-danger-300 text-danger-800 dark:bg-danger-950 dark:border-danger-800 dark:text-danger-200'
    case 'warning':
      return 'bg-warning-50 border-warning-300 text-warning-800 dark:bg-warning-950 dark:border-warning-800 dark:text-warning-200'
    case 'info':
    default:
      return 'bg-info-50 border-info-300 text-info-800 dark:bg-info-950 dark:border-info-800 dark:text-info-200'
  }
}

const getIconColorClasses = (type: string) => {
  switch (type) {
    case 'success':
      return 'text-success-500 dark:text-success-400'
    case 'danger':
      return 'text-danger-500 dark:text-danger-400'
    case 'warning':
      return 'text-warning-500 dark:text-warning-400'
    case 'info':
    default:
      return 'text-info-500 dark:text-info-400'
  }
}
</script>

<template>
  <div class="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-3 pointer-events-none sm:top-6 items-center w-full px-4">
    <transition-group
      enter-active-class="transform ease-out duration-300 transition"
      enter-from-class="-translate-y-4 opacity-0 sm:-translate-y-6"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-4"
      move-class="transition ease-in-out duration-300"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="w-full max-w-sm overflow-hidden rounded-xl border shadow-premium pointer-events-auto transition-all"
        :class="getColorClasses(toast.type)"
      >
        <div class="p-4 flex items-start gap-3">
          <!-- Icon -->
          <div class="flex-shrink-0 mt-0.5" :class="getIconColorClasses(toast.type)" v-html="getIcon(toast.type)"></div>
          
          <!-- Content -->
          <div class="flex-1 min-w-0">
            <h3 class="text-sm font-semibold">{{ toast.title }}</h3>
            <p v-if="toast.message" class="mt-1 text-sm opacity-90 leading-relaxed">{{ toast.message }}</p>
          </div>
          
          <!-- Close Button -->
          <div class="flex-shrink-0 flex">
            <button
              type="button"
              class="inline-flex rounded-lg p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 opacity-60 hover:opacity-100 transition-opacity dark:focus:ring-offset-dark-surface"
              @click="removeToast(toast.id)"
            >
              <span class="sr-only">Fechar</span>
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </transition-group>
  </div>
</template>
