<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import { upperFirst } from "scule";
import { h, resolveComponent } from "vue";
import type { ADDomain } from "~/types/ad/ADDomain";

const currentProjectStore = useCurrentProjectStore();
const toast = useToast();

// Resolve components
const UButton = resolveComponent("UButton");
const UBadge = resolveComponent("UBadge");
const UDropdownMenu = resolveComponent("UDropdownMenu");

// Expandable state
const expanded = ref<Record<string, boolean>>({});

// Table columns definition
const columns: TableColumn<ADDomain>[] = [
  {
    id: "expand",
    cell: ({ row }) =>
      h(UButton, {
        color: "neutral",
        variant: "ghost",
        icon: "i-lucide-chevron-down",
        square: true,
        "aria-label": "Expand",
        ui: {
          leadingIcon: [
            "transition-transform",
            row.getIsExpanded() ? "duration-200 rotate-180" : "",
          ],
        },
        onClick: () => row.toggleExpanded(),
      }),
  },
  {
    accessorKey: "uid",
    header: "UID",
    cell: ({ row }) => `${row.getValue("uid")}`,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => row.getValue("name") ?? "-",
  },
  {
    accessorKey: "dnsName",
    header: "DNS Name",
    cell: ({ row }) => row.getValue("dnsName") ?? "-",
  },
  {
    id: "actions",
    cell: ({ row }) =>
      h(
        "div",
        { class: "text-right" },
        h(
          UDropdownMenu,
          {
            content: { align: "end" },
            items: getRowItems(row),
            "aria-label": "Actions dropdown",
          },
          () =>
            h(UButton, {
              icon: "i-lucide-ellipsis-vertical",
              color: "neutral",
              variant: "ghost",
              class: "ml-auto",
              "aria-label": "Actions dropdown",
            }),
        ),
      ),
  },
];

// Helper function to generate row-specific dropdown items
function getRowItems(row: Row<ADDomain>) {
  return [
    { type: "label", label: "Actions" },
    {
      label: "Copy Full JSON",
      onSelect() {
        navigator.clipboard.writeText(JSON.stringify(row.original));
        toast.add({
          title: "Domain JSON copied to clipboard!",
          color: "success",
          icon: "i-lucide-circle-check",
        });
      },
    },
    { type: "separator" },
    { label: "Delete Domain" },
  ];
}

// Fetch domains on component mount
onMounted(async () => {
  await currentProjectStore.fetchDomains();
});

// Computed table data
const tableData = computed(() =>
  currentProjectStore.domains.map((domain) => ({
    uid: domain.uid,
    name: domain.name,
  })),
);

// Template references and reactive states
const table = useTemplateRef("table");
const columnVisibility = ref({ name: true });
const globalFilter = ref("");
</script>

<template>
  <div class="min-h-[300px] relative">
    <!-- Toolbar -->
    <div
      class="flex justify-end px-4 py-3.5 border-b border-(--ui-border-accented)"
    >
      <UInput v-model="globalFilter" class="max-w-sm" placeholder="Filter..." />
      <UDropdownMenu
        :items="
          table?.tableApi
            ?.getAllColumns()
            .filter((column) => column.getCanHide())
            .map((column) => ({
              label: upperFirst(column.id),
              type: 'checkbox' as const,
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

    <!-- Table -->
    <UTable
      ref="table"
      v-model:expanded="expanded"
      v-model:column-visibility="columnVisibility"
      v-model:global-filter="globalFilter"
      sticky
      :data="tableData"
      :columns="columns"
      :loading="currentProjectStore.loading"
      :ui="{ tr: 'data-[expanded=true]:bg-(--ui-bg-elevated)/50' }"
    >
      <template #expanded="{ row }">
        <h1>Domain Details</h1>
        <pre>{{ row.original }}</pre>
      </template>
    </UTable>

    <!-- Error Message -->
    <div v-if="currentProjectStore.error" class="mt-4 text-red-500">
      Error: {{ currentProjectStore.error.message }}
    </div>
  </div>
</template>
