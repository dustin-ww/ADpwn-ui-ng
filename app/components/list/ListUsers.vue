<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import { upperFirst } from "scule";
import { h, resolveComponent, onMounted, ref } from "vue";
import type { ADUser } from "~/types/ad/ADUsers";


const currentProjectStore = useCurrentProjectStore();
const userStore = useUserStore();
const toast = useToast();

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");

const expanded = ref<Record<string, boolean>>({});
const table = useTemplateRef("table");
const columnVisibility = ref({ samAccountName: true });
const globalFilter = ref("");
const isLoading = ref(true);

onMounted(async () => {
  isLoading.value = true;
  await userStore.fetchUsers(currentProjectStore.uid);
  isLoading.value = false;
});

function getRowItems(row: any) {
  return [
    { type: "label", label: "Actions" },
    {
      label: "Copy Full JSON",
      onSelect() {
        navigator.clipboard.writeText(JSON.stringify(row.original, null, 2));
        toast.add({
          title: "User JSON copied!",
          color: "success",
          icon: "i-lucide-circle-check",
        });
      },
    },
    { type: "separator" },
    {
      label: "Delete User",
      disabled: true, // TODO
    },
  ];
}

const columns: TableColumn<ADUser>[] = [
  {
    id: "expand",
    cell: ({ row }) =>
      h(UButton, {
        color: "neutral",
        variant: "ghost",
        icon: "i-lucide-chevron-down",
        square: true,
        ui: {
          leadingIcon: [
            "transition-transform",
            row.getIsExpanded() ? "rotate-180 duration-200" : "",
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
    header: "Name",
  },
  {
    accessorKey: "samAccountName",
    header: "SAM",
  },
  {
    accessorKey: "upn",
    header: "UPN",
    cell: ({ row }) => row.original.upn || "-",
  },
  {
    accessorKey: "accountType",
    header: "Type",
  },
  {
    accessorKey: "isDomainAdmin",
    header: "DA",
    cell: ({ row }) =>
      row.original.isDomainAdmin
        ? h("span", { class: "text-red-600 font-semibold" }, "Yes")
        : "-",
  },
  {
    accessorKey: "lastLogon",
    header: "Last Logon",
    cell: ({ row }) => {
      if (!row.original.lastLogon) return "-";
      return new Date(row.original.lastLogon).toLocaleDateString();
    },
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
          },
          () =>
            h(UButton, {
              icon: "i-lucide-ellipsis-vertical",
              color: "neutral",
              variant: "ghost",
            }),
        ),
      ),
  },
];
</script>
<template>
  <div class="min-h-[300px] relative">
    <div
      class="flex justify-end gap-2 px-4 py-3.5 border-b border-(--ui-border-accented)"
    >
      <UInput
        v-model="globalFilter"
        class="max-w-sm"
        placeholder="Filter users..."
      />

      <UDropdownMenu
        :items="
          table?.tableApi
            ?.getAllColumns()
            .filter((c) => c.getCanHide())
            .map((c) => ({
              label: upperFirst(c.id),
              type: 'checkbox',
              checked: c.getIsVisible(),
              onUpdateChecked(checked: boolean) {
                table?.tableApi?.getColumn(c.id)?.toggleVisibility(!!checked);
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

    <div class="p-2 text-xs text-gray-600">
      Loaded {{ userStore.users.length }} users
    </div>

    <UTable
      ref="table"
      v-model:expanded="expanded"
      v-model:column-visibility="columnVisibility"
      v-model:global-filter="globalFilter"
      sticky
      :data="userStore.users"
      :columns="columns"
      :loading="isLoading"
      :ui="{ tr: 'data-[expanded=true]:bg-(--ui-bg-elevated)/50' }"
    >
      <template #expanded="{ row }">
        <OverviewUser :user="row.original" />
      </template>
    </UTable>
  </div>
</template>
