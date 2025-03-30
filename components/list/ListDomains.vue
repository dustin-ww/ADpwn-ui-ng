<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';

const currentProjectStore = useCurrentProjectStore();

const columns: TableColumn[] = [
  { accessorKey: "name", header: "Name" },
];

onMounted(async () => {
  await currentProjectStore.fetchDomains();
});

const tableData = computed(() =>
  currentProjectStore.domains.map((domain) => ({
    name: domain.name,
  })),
);


</script>

<template>
    <div class="min-h-[300px] relative">
      <UTable
        :data="tableData"
        :columns="columns"
        :loading="currentProjectStore.loading"
      />

      <div v-if="currentProjectStore.error" class="mt-4 text-red-500">
        Error: {{ currentProjectStore.error.message }}
      </div>
    </div>



</template>
