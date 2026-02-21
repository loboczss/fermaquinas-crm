<script setup lang="ts">
// Page for actually resetting the password
definePageMeta({
  layout: false,
  middleware: 'guest'
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-white dark:bg-dark-bg text-secondary-900 dark:text-dark-text transition-colors duration-300">
    <h1 class="text-3xl font-bold">Redefinir Senha</h1>
  </div>
</template>
