<script setup lang="ts">
// Page for requesting password reset
definePageMeta({
  layout: false,
  middleware: 'guest'
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-white dark:bg-dark-bg text-secondary-900 dark:text-dark-text transition-colors duration-300">
    <h1 class="text-3xl font-bold">Esqueci minha senha</h1>
  </div>
</template>
