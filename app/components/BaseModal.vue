<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  title: string
  description?: string
}>()

const emit = defineEmits(['update:modelValue'])

const close = () => {
  emit('update:modelValue', false)
}
</script>

<template>
  <Teleport to="body">
    <transition
      enter-active-class="ease-out duration-300"
      enter-from-class="opacity-0 backdrop-blur-none"
      enter-to-class="opacity-100 backdrop-blur-sm"
      leave-active-class="ease-in duration-200"
      leave-from-class="opacity-100 backdrop-blur-sm"
      leave-to-class="opacity-0 backdrop-blur-none"
    >
      <div v-if="modelValue" class="relative z-[100]" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-secondary-900/60 dark:bg-dark-bg/90 transition-all" @click="close"></div>

        <div class="fixed inset-0 z-10 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <!-- Modal Panel -->
            <transition
              enter-active-class="ease-out duration-300"
              enter-from-class="opacity-0 translate-y-8 sm:translate-y-0 sm:scale-90"
              enter-to-class="opacity-100 translate-y-0 sm:scale-100"
              leave-active-class="ease-in duration-200"
              leave-from-class="opacity-100 translate-y-0 sm:scale-100"
              leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <div 
                v-if="modelValue"
                class="relative transform overflow-hidden rounded-[2rem] bg-white dark:bg-dark-surface text-left shadow-premium-hover transition-all sm:my-8 w-full max-w-lg border border-secondary-100 dark:border-dark-border"
              >
                <!-- Decorative Top Gradient -->
                <div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600"></div>

                <!-- Header Area -->
                <div class="px-6 pt-8 pb-4 relative">
                  <!-- Close Button -->
                  <div class="absolute right-4 top-6">
                    <button 
                      type="button" 
                      class="h-8 w-8 inline-flex items-center justify-center rounded-full bg-secondary-50 dark:bg-dark-bg text-secondary-500 hover:text-secondary-700 hover:bg-secondary-100 dark:hover:text-secondary-300 dark:hover:bg-dark-border focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all duration-200"
                      @click="close"
                    >
                      <span class="sr-only">Fechar</span>
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div class="flex flex-col items-center text-center space-y-3">
                    <!-- Icon Slot (Centered & Prominent) -->
                    <div v-if="$slots.icon" class="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 mb-2">
                      <slot name="icon"></slot>
                    </div>
                    
                    <div>
                      <h3 class="text-2xl font-bold tracking-tight text-secondary-900 dark:text-dark-text" id="modal-title">
                        {{ title }}
                      </h3>
                      <p v-if="description" class="mt-2 text-sm text-secondary-500 dark:text-secondary-400 max-w-sm mx-auto leading-relaxed">
                        {{ description }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Body Area -->
                <div class="px-6 pb-6 pt-2">
                  <slot></slot>
                </div>

                <!-- Footer Area -->
                <div v-if="$slots.footer" class="bg-secondary-50/50 dark:bg-dark-bg/30 px-6 py-4 border-t border-secondary-100 dark:border-dark-border flex flex-col-reverse sm:flex-row sm:justify-end gap-3 sm:gap-2">
                  <slot name="footer"></slot>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>
