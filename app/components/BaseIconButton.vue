<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'ghost'
  loading?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  loading: false,
  disabled: false,
  type: 'button'
})

const variants = {
  primary: 'text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-950/30',
  secondary: 'text-secondary-600 hover:bg-secondary-50 dark:text-secondary-400 dark:hover:bg-secondary-950/30',
  success: 'text-success-600 hover:bg-success-50 dark:text-success-400 dark:hover:bg-success-950/30',
  danger: 'text-danger-600 hover:bg-danger-50 dark:text-danger-400 dark:hover:bg-danger-950/30',
  warning: 'text-amber-500 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/30',
  info: 'text-blue-500 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30',
  ghost: 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
}
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :title="title"
    :class="[
      'p-2 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed',
      variants[variant]
    ]"
  >
    <svg 
      v-if="loading" 
      class="animate-spin h-5 w-5" 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <slot v-else />
  </button>
</template>
