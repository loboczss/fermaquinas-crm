<script setup lang="ts">
import BaseDropdown from '~/components/BaseDropdown.vue'
import { useAuth } from '~/composables/useAuth'
import { useAuthStore } from '~/stores/useAuthStore'
import { useProfileStore } from '~/stores/profile'
import { computed } from 'vue'

const { logout } = useAuth()
const user = useSupabaseUser()
const authStore = useAuthStore()
const profileStore = useProfileStore()

// Metadata extraction - use profileStore como source de verdade
const userName = computed(() => profileStore.profile?.full_name || user.value?.user_metadata?.full_name || 'Usuário')
const userEmail = computed(() => profileStore.profile?.email || user.value?.email || '')
const userInitials = computed(() => {
  const name = profileStore.profile?.full_name || user.value?.user_metadata?.full_name || 'U'
  return name
    .split(' ')
    .map(n => n.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase()
})
const userAvatar = computed(() => profileStore.profile?.avatar_url || null)

// Role badge
const roleBadgeLabel = computed(() => authStore.isMaster ? 'MASTER' : 'VENDEDOR')
const roleBadgeClasses = computed(() =>
  authStore.isMaster
    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
)

const handleLogout = async () => {
  authStore.clearAuth()
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
  <BaseDropdown :items="dropdownItems" align="right">
    <template #trigger="{ isOpen }">
      <button 
        class="flex items-center gap-2 px-2 py-1 rounded-full border border-transparent hover:border-secondary-200 dark:hover:border-dark-border hover:bg-secondary-50 dark:hover:bg-dark-bg transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
      >
        <!-- User Info (hidden on small screens) -->
        <div class="hidden md:flex flex-col text-right min-w-[120px]">
          <div class="flex items-center justify-end gap-1.5">
            <span class="text-sm font-semibold text-secondary-900 dark:text-dark-text truncate">{{ userName }}</span>
            <span
              v-if="authStore.isRoleLoaded"
              class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase leading-none tracking-wider"
              :class="roleBadgeClasses"
            >
              {{ roleBadgeLabel }}
            </span>
          </div>
          <span class="text-xs text-secondary-500 dark:text-secondary-400 truncate">{{ userEmail }}</span>
        </div>
        
        <!-- Avatar with green dot -->
        <div class="relative flex-shrink-0">
          <!-- Avatar Image if exists -->
          <img
            v-if="userAvatar"
            :src="userAvatar"
            :alt="userName"
            class="w-9 h-9 rounded-full object-cover ring-1 ring-secondary-200/70 dark:ring-dark-border/80"
          />
          <!-- Avatar Initials as fallback -->
          <div
            v-else
            class="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 dark:from-primary-500 dark:to-primary-700 flex items-center justify-center text-white text-xs font-bold ring-1 ring-secondary-200/70 dark:ring-dark-border/80"
          >
            {{ userInitials }}
          </div>
          <!-- Online Indicator -->
          <span class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-dark-surface rounded-full"></span>
        </div>
        
        <!-- Dropdown Arrow -->
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-secondary-500 dark:text-secondary-400 transition-transform duration-200" :class="{'rotate-180': isOpen}" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>
    </template>
  </BaseDropdown>
</template>
