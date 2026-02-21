<script setup lang="ts">
import { useDarkMode } from '~/composables/useDarkMode'

const { isDark } = useDarkMode()

// Aplica a classe .dark ao elemento <html> para que o Tailwind detecte o modo escuro
watchEffect(() => {
  if (import.meta.client) {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
})
</script>

<template>
  <div class="min-h-screen bg-secondary-50 dark:bg-dark-bg text-secondary-900 dark:text-dark-text font-sans antialiased transition-colors duration-300">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <AppToast />
  </div>
</template>

<style>
.page-enter-active,
.page-leave-active {
  @apply transition-all duration-300 ease-out;
}

.page-enter-from {
  @apply opacity-0 translate-y-1;
}

.page-leave-to {
  @apply opacity-0 -translate-y-1;
}
</style>
