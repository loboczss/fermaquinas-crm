<script setup lang="ts">
import { ref, h } from 'vue'

interface DropdownItem {
  label?: string
  icon?: string // Nome do ícone (user, creditCard, logout)
  onClick?: () => void
  to?: string
  variant?: 'default' | 'danger'
  divider?: boolean
}

interface Props {
  items: DropdownItem[]
  align?: 'left' | 'right'
}

const props = withDefaults(defineProps<Props>(), {
  align: 'right'
})

const isOpen = ref(false)

const toggle = () => {
  isOpen.value = !isOpen.value
}

const close = () => {
  isOpen.value = false
}

const handleItemClick = (item: DropdownItem) => {
  if (item.onClick) {
    item.onClick()
  }
  close()
}

// Icon components mapping
const icons: Record<string, string> = {
  user: 'M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z',
  chat: 'M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.5 1a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm5 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm5 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3z',
  crm: 'M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z',
  calendar: 'M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z',
  sales: 'M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z',
  dashboard: 'M3 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm8 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V4zM4 11a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1v-4a1 1 0 00-1-1H4zm8 0a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1v-4a1 1 0 00-1-1h-4z',
  creditCard: 'M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z M2 9v5a2 2 0 002 2h12a2 2 0 002-2V9H2zm2 4a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z',
  logout: 'M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z'
}

defineExpose({ toggle, close, isOpen })
</script>

<template>
  <div class="relative">
    <!-- Trigger Slot -->
    <div @click="toggle">
      <slot name="trigger" :isOpen="isOpen" :toggle="toggle" />
    </div>

    <!-- Invisible Overlay -->
    <div v-if="isOpen" @click="close" class="fixed inset-0 z-40"></div>

    <!-- Dropdown Menu -->
    <transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="transform opacity-0 scale-95 -translate-y-2"
      enter-to-class="transform opacity-100 scale-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="transform opacity-100 scale-100 translate-y-0"
      leave-to-class="transform opacity-0 scale-95 -translate-y-2"
    >
      <div 
        v-if="isOpen" 
        :class="[
          'absolute mt-2 w-56 bg-white dark:bg-dark-surface rounded-2xl shadow-premium border border-secondary-100 dark:border-dark-border overflow-hidden z-50 p-2 space-y-1',
          align === 'right' ? 'right-0' : 'left-0'
        ]"
      >
        <template v-for="(item, index) in items" :key="index">
          <!-- Divider -->
          <div v-if="item.divider" class="h-px bg-secondary-100 dark:bg-dark-border my-1"></div>

          <!-- Link Item -->
          <NuxtLink 
            v-else-if="item.to"
            :to="item.to" 
            @click="close"
            :class="[
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
              item.variant === 'danger' 
                ? 'text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20'
                : 'text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-dark-bg'
            ]"
          >
            <svg v-if="item.icon && icons[item.icon]" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path :d="icons[item.icon]" fill-rule="evenodd" clip-rule="evenodd"/>
            </svg>
            {{ item.label }}
          </NuxtLink>

          <!-- Button Item -->
          <button 
            v-else
            @click="handleItemClick(item)"
            :class="[
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
              item.variant === 'danger' 
                ? 'text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20'
                : 'text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-dark-bg'
            ]"
          >
            <svg v-if="item.icon && icons[item.icon]" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path :d="icons[item.icon]" fill-rule="evenodd" clip-rule="evenodd"/>
            </svg>
            {{ item.label }}
          </button>
        </template>
      </div>
    </transition>
  </div>
</template>
