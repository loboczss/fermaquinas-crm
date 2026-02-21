<script setup lang="ts">
import { ref, computed } from 'vue'

// Define which attributes fall through to the input instead of the root div
defineOptions({
  inheritAttrs: false
})

interface Props {
  modelValue: string | number
  label?: string
  type?: string
  placeholder?: string
  error?: string
  disabled?: boolean
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  disabled: false
})

defineEmits(['update:modelValue'])

const showPassword = ref(false)
const inputId = props.id || useId()

const inputType = computed(() => {
  if (props.type === 'password') {
    return showPassword.value ? 'text' : 'password'
  }
  return props.type
})
</script>

<template>
  <div class="flex flex-col gap-1.5 w-full">
    <label 
      v-if="label" 
      :for="inputId" 
      class="text-sm font-medium text-secondary-700 dark:text-secondary-300"
    >
      {{ label }}
    </label>
    
    <div class="relative group">
      <input
        v-bind="$attrs"
        :id="inputId"
        :type="inputType"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        :class="[
          'w-full px-4 py-2.5 rounded-xl border transition-all duration-300 outline-none',
          'bg-white dark:bg-dark-surface text-secondary-900 dark:text-dark-text',
          error 
            ? 'border-danger-500 focus:ring-2 focus:ring-danger-500/20' 
            : 'border-secondary-200 dark:border-dark-border focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 dark:focus:ring-primary-500/5',
          'disabled:bg-secondary-50 dark:disabled:bg-secondary-900/20 disabled:cursor-not-allowed',
          props.type === 'password' ? 'pr-12' : ''
        ]"
      />
      
      <!-- Password Toggle -->
      <button 
        v-if="props.type === 'password'"
        type="button"
        @click="showPassword = !showPassword"
        class="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-secondary-400 hover:text-primary-500 transition-colors focus:outline-none"
        tabindex="-1"
      >
        <!-- Eye Icon -->
        <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <!-- Eye Off Icon -->
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 1.274-4.057-5.064-7-9.542-7-4.477 0-8.268-2.943-9.542-7zM20 20L4 4m6 8a3 3 0 116 0 3 3 0 01-6 0z" />
        </svg>
      </button>
    </div>
    
    <span 
      v-if="error" 
      class="text-xs text-danger-500 mt-0.5"
    >
      {{ error }}
    </span>
  </div>
</template>
