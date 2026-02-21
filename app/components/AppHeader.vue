<script setup lang="ts">
import { ref } from 'vue'
import ThemeToggle from '~/components/ThemeToggle.vue'
import BaseButton from '~/components/BaseButton.vue'
import MenuDropdown from '~/components/header/MenuDropdown.vue'
import NotificationsDropdown from '~/components/header/NotificationsDropdown.vue'

const user = useSupabaseUser()
const isMobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}
</script>

<template>
  <header class="bg-white dark:bg-dark-surface border-b border-secondary-200/70 dark:border-dark-border/80 sticky top-0 z-50 transition-colors duration-300">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 h-14 flex justify-between items-center">
      
      <!-- Left Section: Logo & Hamburger -->
      <div class="flex items-center gap-4">
        <!-- Mobile Menu Button -->
        <button
          @click="toggleMobileMenu"
          class="md:hidden p-1.5 -ml-1.5 rounded-lg text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-dark-bg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <span class="sr-only">{{ isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu' }}</span>
          <svg v-if="!isMobileMenuOpen" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
          <svg v-else class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2.5 group flex-shrink-0" @click="isMobileMenuOpen = false">
          <div class="w-9 h-9 bg-primary-500 rounded-lg flex items-center justify-center text-white shadow-sm transition-transform duration-200 group-hover:scale-[1.03]">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
            </svg>
          </div>
          <span class="text-xl font-bold font-sans text-secondary-900 dark:text-dark-text tracking-tight hidden sm:block">
            ZapMulti
          </span>
        </NuxtLink>
      </div>
      
      <!-- Main Navigation (Desktop Only) -->
      <nav class="hidden md:flex items-center gap-1">
        <NuxtLink
          to="/dashboard"
          active-class="text-secondary-900 dark:text-white after:scale-x-100"
          class="relative px-2.5 py-1.5 rounded-md text-sm font-semibold text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-dark-bg transition-all duration-200 hover:-translate-y-0.5 after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-full after:bg-primary-500 after:scale-x-0 after:origin-left after:transition-transform after:duration-200 hover:after:scale-x-100"
        >
          Dashboard
        </NuxtLink>
        <NuxtLink
          to="/crm"
          active-class="text-secondary-900 dark:text-white after:scale-x-100"
          class="relative px-2.5 py-1.5 rounded-md text-sm font-semibold text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-dark-bg transition-all duration-200 hover:-translate-y-0.5 after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-full after:bg-primary-500 after:scale-x-0 after:origin-left after:transition-transform after:duration-200 hover:after:scale-x-100"
        >
          CRM
        </NuxtLink>
        <NuxtLink
          to="/calendario"
          active-class="text-secondary-900 dark:text-white after:scale-x-100"
          class="relative px-2.5 py-1.5 rounded-md text-sm font-semibold text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-dark-bg transition-all duration-200 hover:-translate-y-0.5 after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-full after:bg-primary-500 after:scale-x-0 after:origin-left after:transition-transform after:duration-200 hover:after:scale-x-100"
        >
          Calendario
        </NuxtLink>
        <NuxtLink
          to="/vendas"
          active-class="text-secondary-900 dark:text-white after:scale-x-100"
          class="relative px-2.5 py-1.5 rounded-md text-sm font-semibold text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-dark-bg transition-all duration-200 hover:-translate-y-0.5 after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-full after:bg-primary-500 after:scale-x-0 after:origin-left after:transition-transform after:duration-200 hover:after:scale-x-100"
        >
          Vendas
        </NuxtLink>
      </nav>

      <!-- Right Side Actions -->
      <div class="flex items-center gap-2">
        <template v-if="user">
          <ThemeToggle />
          <NotificationsDropdown />
          <MenuDropdown />
        </template>
        <template v-else>
          <ThemeToggle />
          <NuxtLink to="/login">
            <BaseButton variant="primary" size="sm" class="shadow-sm">
              Entrar
            </BaseButton>
          </NuxtLink>
        </template>
      </div>
    </div>

    <!-- Mobile Navigation Overlay -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="isMobileMenuOpen" class="md:hidden absolute top-14 left-0 w-full bg-white dark:bg-dark-surface border-b border-secondary-200 dark:border-dark-border shadow-lg">
        <div class="px-4 py-3 space-y-1">
          <NuxtLink
            to="/dashboard"
            @click="isMobileMenuOpen = false"
            active-class="bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-semibold"
            class="block px-3 py-2.5 rounded-xl text-base font-medium text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-dark-bg transition-colors"
          >
            Dashboard
          </NuxtLink>
          <NuxtLink
            to="/crm"
            @click="isMobileMenuOpen = false"
            active-class="bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-semibold"
            class="block px-3 py-2.5 rounded-xl text-base font-medium text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-dark-bg transition-colors"
          >
            CRM
          </NuxtLink>
          <NuxtLink
            to="/calendario"
            @click="isMobileMenuOpen = false"
            active-class="bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-semibold"
            class="block px-3 py-2.5 rounded-xl text-base font-medium text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-dark-bg transition-colors"
          >
            Calendario
          </NuxtLink>
          <NuxtLink
            to="/vendas"
            @click="isMobileMenuOpen = false"
            active-class="bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-semibold"
            class="block px-3 py-2.5 rounded-xl text-base font-medium text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-dark-bg transition-colors"
          >
            Vendas
          </NuxtLink>
        </div>
      </div>
    </Transition>
  </header>
</template>
