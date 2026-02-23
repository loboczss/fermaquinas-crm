<script setup lang="ts">
import { onMounted } from 'vue'
import { useProdutosStore } from '~/stores/useProdutosStore'
import ProdutosHeader from '~/components/produtos/ProdutosHeader.vue'
import ProdutosTable from '~/components/produtos/ProdutosTable.vue'

const store = useProdutosStore()

onMounted(() => {
  store.fetchProdutos()
})
</script>

<template>
  <main class="min-h-[calc(100vh-3.5rem)] bg-gray-50/50 dark:bg-gray-900 transition-colors p-4 sm:p-6 lg:p-8">
    <div class="max-w-7xl mx-auto flex flex-col h-full">
      <!-- Header Area (Title and Search) -->
      <ProdutosHeader />

      <!-- Main Content (Table and Pagination) -->
      <div class="flex-1 animate-in fade-in slide-in-from-bottom-4 duration-700 flex flex-col h-[calc(100vh-12rem)] min-h-[500px]">
        <ProdutosTable />
      </div>
    </div>
  </main>
</template>
