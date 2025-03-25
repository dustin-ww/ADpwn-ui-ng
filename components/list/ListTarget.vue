<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import { useProjectsApi } from "~/composables/api/useProjectsApi";
import type { Target } from "~/types/adpwn/ADPwnProject";

const projectStore = useProjectStore();
const projectApi = useProjectsApi();

const { data: targets } = await useAsyncData("targets", () =>
  projectApi.getTargets(projectStore.project.id),
);

const tableData = computed(
  () =>
    targets.value?.data?.map((target) => ({
      ip: target.ip_range,
      note: target.name,
    })) || [],
);

const columns: TableColumn<Target>[] = [
  { accessorKey: "ip", header: "IP" },
  { accessorKey: "note", header: "Note" },
];

const columnFilters = ref([
  {
    id: "",
    value: "",
  },
]);

const table = useTemplateRef("table");
</script>
<template>
  <h1 class="text-3xl">Targets</h1>
  <UInput
    :model-value="table?.tableApi?.getColumn('ip')?.getFilterValue() as string"
    class="max-w-sm"
    placeholder="Filter ips..."
    @update:model-value="
      table?.tableApi?.getColumn('ip')?.setFilterValue($event)
    "
  />
  <div class="min-h-[300px]">
    <!-- Add this wrapper div with minimum height -->
    <UTable
      ref="table"
      v-model:column-filters="columnFilters"
      :data="tableData"
      :columns="columns"
    />
  </div>
</template>
