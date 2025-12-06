<script setup lang="ts">
import { h, resolveComponent, computed } from "vue";
import { upperFirst } from "scule";
import type { TableColumn } from "@nuxt/ui";
import type { ADPwnModule } from "~/types/adpwn/ADPwnModule";
import { UButton } from "#components";

const UCheckbox = resolveComponent("UCheckbox");
const UBadge = resolveComponent("UBadge");

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
    type: module.moduleType,
    attackId: module.attackId,
    description: module.description,
  }));
});

const columns: TableColumn<ADPwnModule>[] = [
  {
    id: "select",
    header: ({ table }) =>
      h(UCheckbox, {
        modelValue: table.getIsSomePageRowsSelected()
          ? "indeterminate"
          : table.getIsAllPageRowsSelected(),
        "onUpdate:modelValue": (value: boolean | "indeterminate") =>
          table.toggleAllPageRowsSelected(!!value),
        "aria-label": "Select all",
      }),
    cell: ({ row }) =>
      h(UCheckbox, {
        modelValue: row.getIsSelected(),
        "onUpdate:modelValue": (value: boolean | "indeterminate") =>
          row.toggleSelected(!!value),
        "aria-label": "Select row",
      }),
  },
  {
    accessorKey: "key",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return h(UButton, {
        color: "neutral",
        variant: "ghost",
        label: "Key",
        icon: isSorted
          ? isSorted === "asc"
            ? "i-lucide-arrow-up-narrow-wide"
            : "i-lucide-arrow-down-wide-narrow"
          : "i-lucide-arrow-up-down",
        class: "-mx-2.5",
        onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      });
    },
  },
  { accessorKey: "author", header: "Author" },
  { accessorKey: "type", header: "Type" },
  {
    accessorKey: "attackId",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return h(UButton, {
        color: "neutral",
        variant: "ghost",
        label: "Attack ID",
        icon: isSorted
          ? isSorted === "asc"
            ? "i-lucide-arrow-up-narrow-wide"
            : "i-lucide-arrow-down-wide-narrow"
          : "i-lucide-arrow-up-down",
        class: "-mx-2.5",
        onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      });
    },
  },
  { accessorKey: "description", header: "Description" },
  { id: "action" },
];

const sorting = ref([
  {
    id: "key",
    desc: false,
  },
]);

const table = useTemplateRef("table");
const columnVisibility = ref({});

const columnFilters = ref([
  {
    id: "key",
    value: "",
  },
]);

const rowSelection = ref({});
</script>

<template>
  <div class="flex flex-col flex-1 w-full">
    <SharedHeading heading="Manage Modules" />
    <div
      class="flex justify-between px-4 py-3.5 border-b border-(--ui-border-accented)"
    >
      <UInput
        :model-value="
          table?.tableApi?.getColumn('key')?.getFilterValue() as string
        "
        class="max-w-sm"
        placeholder="Filter keys..."
        @update:model-value="
          table?.tableApi?.getColumn('key')?.setFilterValue($event)
        "
      />

      <UDropdownMenu
        :items="
          table?.tableApi
            ?.getAllColumns()
            .filter((column) => column.getCanHide())
            .map((column) => ({
              label: upperFirst(column.id),
              type: 'checkbox',
              checked: column.getIsVisible(),
              onUpdateChecked(checked: boolean) {
                table?.tableApi
                  ?.getColumn(column.id)
                  ?.toggleVisibility(!!checked);
              },
              onSelect(e?: Event) {
                e?.preventDefault();
              },
            }))
        "
        :content="{ align: 'end' }"
      >
        <UButton
          label="Columns"
          color="neutral"
          variant="outline"
          trailing-icon="i-lucide-chevron-down"
        />
      </UDropdownMenu>
    </div>

    <UTable
      ref="table"
      v-model:sorting="sorting"
      v-model:column-visibility="columnVisibility"
      v-model:column-filters="columnFilters"
      v-model:row-selection="rowSelection"
      :data="tableData"
      :columns="columns"
      class="flex-1"
    >
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

    <div
      class="px-4 py-3.5 border-t border-(--ui-border-accented) text-sm text-(--ui-text-muted)"
    >
      {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length || 0 }} of
      {{ table?.tableApi?.getFilteredRowModel().rows.length || 0 }} row(s)
      selected.
    </div>
  </div>
</template>
