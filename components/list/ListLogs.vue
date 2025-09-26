<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

const currentProjectStore = useCurrentProjectStore();
const logData = ref<{ id: string; message: string }[]>([]);

onMounted(async () => {
  const result = await currentProjectStore.fetchLogs();
  console.log(result);
  logData.value = result.map((log_entry: ADPwnLogEntry) => ({
    id: log_entry.id,
    message: log_entry.message,
    payload: atob(log_entry.payload),
    timestamp: log_entry.timestamp,
    module_key: log_entry.moduleKey,
    level: log_entry.level,
    isSystemLog: log_entry.projectUID === "SYSTEM"
  }));
});

const columns: TableColumn[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "module_key", header: "Module Key" },
    { accessorKey: "message", header: "Message" },
    { accessorKey: "timestamp", header: "Timestamp" },
    { accessorKey: "level", header: "Level" },
    { accessorKey: "payload", header: "Payload" },
    { accessorKey: "isSystemLog", header: "System Log" },

];

const columnFilters = ref([{ message: "", value: "" }]);
const table = useTemplateRef("table");
</script>


<template>
  <div class="space-y-4">
    <UInput
      :model-value="
        table?.tableApi?.getColumn('message')?.getFilterValue() as string
      "
      class="max-w-sm"
      placeholder="Filter Messages..."
      @update:model-value="
        table?.tableApi?.getColumn('message')?.setFilterValue($event)
      "
    />

    <div class="min-h-[300px] relative">
      <UTable
        ref="table"
        v-model:column-filters="columnFilters"
        :data="logData"
        :columns="columns"
        :loading="currentProjectStore.loading"
      />

      <div v-if="currentProjectStore.error" class="mt-4 text-red-500">
        Error: {{ currentProjectStore.error.message }}
      </div>
    </div>
  </div>
</template>
