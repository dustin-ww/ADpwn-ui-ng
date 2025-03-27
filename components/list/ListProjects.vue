<script setup lang="ts">
import { computed } from "vue";
import type { TableColumn } from "@nuxt/ui";
import type { ADPwnProject } from "~/types/adpwn/ADPwnProject";

const props = defineProps<{
  projects?: ADPwnProject[];
  loading?: boolean;
}>();

const tableData = computed(() => {
  const projects = props.projects || [];
  return projects.map((project) => ({
    id: project.uid,
    name: project.name,
    description: project.description,
  }));
});

const columns: TableColumn<ADPwnProject>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "description", header: "Description" },
  { id: "action" },
];
</script>

<template>
  <UTable :data="tableData" :columns="columns" class="flex-1">
    <template #name-cell="{ row }">
      <div class="flex items-center gap-3">
        <div>
          <p class="font-medium text-(--ui-text-highlighted)">
            {{ row.original.name }}
          </p>
          <p>
            {{ row.original.position }}
          </p>
        </div>
      </div>
    </template>
    <template #action-cell="{ row }">
      <slot name="row-actions" :row="row" />
    </template>
  </UTable>
</template>
