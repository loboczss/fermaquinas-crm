<script setup lang="ts">
import { onMounted } from 'vue'
import { useCrmStore } from '~/stores/useCrmStore'
import CrmHeader from '~/components/crm/CrmHeader.vue'
import CrmTable from '~/components/crm/CrmTable.vue'
import CrmPagination from '~/components/crm/CrmPagination.vue'
import CrmClientDrawer from '~/components/crm/CrmClientDrawer.vue'
import CrmEditModal from '~/components/crm/CrmEditModal.vue'
import CrmCreateModal from '~/components/crm/CrmCreateModal.vue'

const store = useCrmStore()

onMounted(async () => {
  await store.fetchClientes()
})
</script>

<template>
  <main class="min-h-[calc(100vh-3.5rem)] bg-gray-50/50 dark:bg-gray-900 transition-colors p-4 sm:p-6 lg:p-8">
    <div class="max-w-7xl mx-auto h-full flex flex-col">
      <!-- Header with search -->
      <div class="shrink-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <CrmHeader />
      </div>

      <!-- Main CRM Table -->
      <div class="mt-6 flex flex-col flex-1 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div class="flex-1">
          <CrmTable />
        </div>
        <!-- Pagination Component -->
        <CrmPagination />
      </div>

      <!-- Detail Slide-over -->
      <CrmClientDrawer />

      <!-- Edit Modal -->
      <CrmEditModal />

      <!-- Create Modal -->
      <CrmCreateModal />
    </div>
  </main>
</template>
