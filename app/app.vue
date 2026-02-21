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
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

