<script setup lang="ts">
import AppHeader from '~/components/AppHeader.vue'
</script>

<template>
  <div class="min-h-screen bg-secondary-50 dark:bg-dark-bg text-secondary-900 dark:text-dark-text transition-colors duration-300 flex flex-col">
    <AppHeader />
    <main class="flex-grow">
      <slot />
    </main>
  </div>
</template>
