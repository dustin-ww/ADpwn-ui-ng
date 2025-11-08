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

// Helper function to generate row-specific dropdown items
function getRowItems(row: any) {
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
  },
  {
    accessorKey: "name",
    header: "Domain Name",
  },
  {
    accessorKey: "created",
    header: "Created",
    cell: ({ row }) => {
      const date = new Date(row.original.created);
      return date.toLocaleDateString();
    }
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

// Fetch domains
const domainStore = useDomainStore();

const domains = ref<ADDomain[]>([]);
const isLoading = ref(true);

// WICHTIG: useAsyncData verwenden statt onMounted für SSR
const { data: domainsData, pending } = await useAsyncData(
  'domains',
  async () => {
    const result = await domainStore.fetchDomains(currentProjectStore.uid, {
      skipCache: true,
    });
    return (result as { data?: ADDomain[] }).data ?? [];
  }
);

// Reactive domains
watchEffect(() => {
  if (domainsData.value) {
    domains.value = domainsData.value;
  }
  isLoading.value = pending.value;
});

// Template references and reactive states
const table = useTemplateRef("table");
const columnVisibility = ref({ name: true });
const globalFilter = ref("");
</script>

<template>
  <div class="min-h-[300px] relative">
    <!-- Toolbar -->
    <div
      class="flex justify-end gap-2 px-4 py-3.5 border-b border-(--ui-border-accented)"
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

    <!-- Debug Info (zum Testen) -->
    <div class="p-2 text-xs text-gray-600">
      Loaded {{ domains.length }} domains
    </div>

    <!-- Table -->
    <UTable
      ref="table"
      v-model:expanded="expanded"
      v-model:column-visibility="columnVisibility"
      v-model:global-filter="globalFilter"
      sticky
      :data="domains"
      :columns="columns"
      :loading="isLoading"
      :ui="{ tr: 'data-[expanded=true]:bg-(--ui-bg-elevated)/50' }"
    >
      <template #expanded="{ row }">
        <div class="p-4 bg-gray-50">
          <h3 class="text-lg font-semibold mb-2">Domain Details</h3>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div><strong>UID:</strong> {{ row.original.uid }}</div>
            <div><strong>Name:</strong> {{ row.original.name }}</div>
            <div><strong>Created:</strong> {{ new Date(row.original.created).toLocaleString() }}</div>
            <div><strong>Modified:</strong> {{ new Date(row.original.last_modified).toLocaleString() }}</div>
          </div>
          <details class="mt-4">
            <summary class="cursor-pointer font-semibold">Full JSON</summary>
            <pre class="text-xs mt-2 p-2 bg-white rounded">{{ row.original }}</pre>
          </details>
        </div>
      </template>
    </UTable>

    <!-- Error Message -->
    <div v-if="currentProjectStore.error" class="mt-4 text-red-500">
      Error: {{ currentProjectStore.error.message }}
    </div>
  </div>
</template>