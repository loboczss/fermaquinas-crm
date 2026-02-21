<script setup lang="ts">
import ThemeToggle from '~/components/ThemeToggle.vue'
import BaseButton from '~/components/BaseButton.vue'
import BaseDropdown from '~/components/BaseDropdown.vue'
import { useAuth } from '~/composables/useAuth'
import { computed } from 'vue'

const { logout } = useAuth()
const user = useSupabaseUser()

// Metadata extraction
const userName = computed(() => user.value?.user_metadata?.full_name || 'Usuário')
const userEmail = computed(() => user.value?.email || '')
const userInitials = computed(() => userName.value.charAt(0).toUpperCase())

const handleLogout = async () => {
  await logout()
  navigateTo('/login')
}

// Dropdown items
const dropdownItems = [
  {
    label: 'Perfil',
    to: '/perfil',
    icon: 'user'
  },
  {
    label: 'Assinatura',
    to: '/assinatura',
    icon: 'creditCard'
  },
  {
    divider: true
  },
  {
    label: 'Sair',
    onClick: handleLogout,
    variant: 'danger' as const,
    icon: 'logout'
  }
]
</script>

<template>
  <header class="bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md border-b border-secondary-200 dark:border-dark-border sticky top-0 z-50 transition-colors duration-300">
    <div class="container mx-auto px-6 h-16 flex justify-between items-center gap-4">
      <!-- Logo -->
      <NuxtLink to="/" class="flex items-center gap-2 group">
        <div class="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white shadow-sm group-hover:shadow-primary-500/30 transition-shadow">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
          </svg>
        </div>
        <span class="text-xl font-bold font-sans text-secondary-900 dark:text-dark-text tracking-tight flex-shrink-0">
          ZapMulti
        </span>
      </NuxtLink>
      
      <!-- Right Side Actions -->
      <div class="flex items-center gap-4 sm:gap-6">
        
        <ThemeToggle />

        <div class="h-6 w-px bg-secondary-200 dark:bg-dark-border hidden sm:block"></div>

        <!-- User Profile Section -->
        <template v-if="user">
          <BaseDropdown :items="dropdownItems" align="right">
            <template #trigger="{ isOpen }">
              <button 
                class="flex items-center gap-3 hover:bg-secondary-50 dark:hover:bg-dark-bg p-1.5 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              >
                <div class="hidden sm:flex flex-col text-right truncate max-w-[150px]">
                  <span class="text-sm font-semibold text-secondary-900 dark:text-dark-text truncate leading-tight">{{ userName }}</span>
                  <span class="text-[11px] text-secondary-500 dark:text-secondary-400 truncate leading-tight">{{ userEmail }}</span>
                </div>
                <div class="w-9 h-9 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/60 dark:to-primary-800/60 text-primary-700 dark:text-primary-300 border border-primary-200/50 dark:border-primary-700/50 flex items-center justify-center text-sm font-bold shadow-sm flex-shrink-0 relative overflow-hidden">
                  {{ userInitials }}
                  <!-- Online Indicator -->
                  <span class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success-500 border-2 border-white dark:border-dark-surface rounded-full"></span>
                </div>
                
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-secondary-400 transition-transform duration-200" :class="{'rotate-180': isOpen}" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </template>
          </BaseDropdown>
        </template>
        
        <template v-else>
           <NuxtLink to="/login">
            <BaseButton variant="primary" size="sm" class="shadow-sm">
              Entrar
            </BaseButton>
           </NuxtLink>
        </template>
      </div>
    </div>
  </header>
</template>
