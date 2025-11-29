<script setup lang="ts">
import { useCurrentProjectStore } from "~/stores/currentProjectStore";
import type { TableColumn } from "@nuxt/ui";

const currentProjectStore = useCurrentProjectStore();

const tableData = computed(() =>
  currentProjectStore.targets.map((target) => ({
    ip: target.ip,
    cidr: target.cidr,
    note: target.note,
  })),
);

const columns: TableColumn[] = [
  { accessorKey: "ip", header: "IP" },
  { accessorKey: "cidr", header: "CIDR" },
  { accessorKey: "note", header: "Note" },
];

const columnFilters = ref([{ ip: "", value: "" }]);
const table = useTemplateRef("table");

onMounted(async () => {
  await currentProjectStore.fetchTargets();
  console.log(currentProjectStore.targets);
});
</script>

<template>
  <div class="space-y-4">
    <UInput
      :model-value="
        table?.tableApi?.getColumn('ip')?.getFilterValue() as string
      "
      class="max-w-sm"
      placeholder="Filter IPs..."
      @update:model-value="
        table?.tableApi?.getColumn('ip')?.setFilterValue($event)
      "
    />

    <div class="min-h-[300px] relative">
      <UTable
        ref="table"
        v-model:column-filters="columnFilters"
        :data="tableData"
        :columns="columns"
        :loading="currentProjectStore.loading"
      />

      <div v-if="currentProjectStore.error" class="mt-4 text-red-500">
        Error: {{ currentProjectStore.error.message }}
      </div>
    </div>
  </div>
</template>
