<script setup lang="ts">
import LoginHero from '~/components/login/LoginHero.vue'
import LoginForm from '~/components/login/LoginForm.vue'

// Opcional: configurar um layout vazio se você tiver um layout padrão com header/footer
definePageMeta({
  layout: false,
  middleware: 'guest'
})
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-dark-bg flex w-full">
    <!-- Componente da Esquerda (Hero) visível apenas em telas grandes -->
    <div class="hidden lg:block lg:w-1/2 w-full">
      <LoginHero />
    </div>

    <!-- Componente da Direita (Formulário) -->
    <div class="w-full lg:w-1/2">
      <LoginForm />
    </div>
  </div>
</template>
