<script setup lang="ts">
import { computed } from "vue";
import type { TableColumn } from "@nuxt/ui";
import type { ADPwnModule } from "~/types/adpwn/ADPwnModule";

const props = defineProps<{
  modules?: ADPwnModule[];
  loading?: boolean;
}>();

const tableData = computed(() => {
  const modules = props.modules || [];
  if (!Array.isArray(modules)) {
    return [];
  }
  return modules.map((module) => ({
    key: module.key,
    author: module.author,
    type: module.module_type,
    attack_id: module.attack_id,
    description: module.description,
  }));
});

const columns: TableColumn<ADPwnModule>[] = [
  { accessorKey: "key", header: "ID" },
  { accessorKey: "author", header: "Author" },
  { accessorKey: "type", header: "Type" },
  { accessorKey: "attack_id", header: "Attack ID" },
  { accessorKey: "description", header: "Description" },
  { id: "action" },
];
</script>

<template>
  <UTable :data="tableData" :columns="columns" class="flex-1">
    <template #type-cell="{ row }">
      <div>
        <UBadge
          :color="
            row.original.type === 'AttackModule'
              ? 'error'
              : row.original.type === 'EnumerationModule'
                ? 'success'
                : 'neutral'
          "
        >
          {{ row.original.type }}
        </UBadge>
      </div>
    </template>

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
