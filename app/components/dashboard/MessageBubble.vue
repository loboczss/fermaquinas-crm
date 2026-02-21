<script setup lang="ts">
import type { Mensagem } from '~/stores/useChatDashboard'
import { format, parseISO } from 'date-fns'

const props = defineProps<{
  mensagem: Mensagem
}>()

const isCliente = computed(() => props.mensagem.sender_type === 'Cliente')

const horaFormatada = computed(() => {
  try {
    return format(parseISO(props.mensagem.created_at), 'HH:mm')
  } catch {
    return ''
  }
})
</script>

<template>
  <div
    class="flex mb-4 group"
    :class="isCliente ? 'justify-start' : 'justify-end'"
  >
    <div
      class="max-w-[85%] sm:max-w-[70%] px-4 py-2.5 shadow-sm relative transition-all duration-200"
      :class="
        isCliente
          ? 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-2xl rounded-tl-sm text-gray-800 dark:text-gray-100'
          : 'bg-primary-600 dark:bg-primary-600 border border-primary-600 dark:border-primary-600 rounded-2xl rounded-tr-sm text-white'
      "
    >
      <!-- Nome do remetente (vendedor) -->
      <p
        v-if="!isCliente && mensagem.sender_name"
        class="text-[11px] font-medium text-primary-200 mb-1 tracking-wide"
      >
        {{ !mensagem.sender_name.includes('.') ? mensagem.sender_name : 'Atendente' }}
      </p>
      <p
        v-else-if="isCliente && mensagem.sender_name"
        class="text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-1 tracking-wide"
      >
        Líder
      </p>

      <!-- Texto -->
      <div 
        class="text-[14.5px] whitespace-pre-wrap break-words leading-relaxed"
        :class="isCliente ? 'text-gray-700 dark:text-gray-200' : 'text-primary-50'"
      >
        {{ mensagem.mensagem }}
      </div>

      <!-- Hora -->
      <div 
        class="flex justify-end items-center gap-1 mt-1.5"
      >
        <span 
          class="text-[10px] tabular-nums"
          :class="isCliente ? 'text-gray-400 dark:text-gray-500' : 'text-primary-200/80'"
        >
          {{ horaFormatada }}
        </span>
        <svg v-if="!isCliente" class="w-3.5 h-3.5 text-primary-200/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    </div>
  </div>
</template>
