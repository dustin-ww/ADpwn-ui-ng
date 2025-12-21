<script setup lang="ts">
import { OverviewHost } from "#components"
import type { TableColumn } from "@nuxt/ui"
import { upperFirst } from "scule"
import { h, resolveComponent } from "vue"
import type { ADHost } from "~/types/ad/ADHost"

const currentProjectStore = useCurrentProjectStore()
const toast = useToast()
const { fetchDomainsWithHosts, enrichedHosts } = useDomainHostData()

const UButton = resolveComponent("UButton")
const UDropdownMenu = resolveComponent("UDropdownMenu")

const expanded = ref<Record<string, boolean>>({})

const table = useTemplateRef("table")
const columnVisibility = ref({ hostname: true })
const globalFilter = ref("")
const isLoading = ref(true)

onMounted(async () => {
  isLoading.value = true
  await fetchDomainsWithHosts(currentProjectStore.uid)
  isLoading.value = false
})

function getRowItems(row: any) {
  return [
    { type: "label", label: "Actions" },
    {
      label: "Copy Full JSON",
      onSelect() {
        navigator.clipboard.writeText(JSON.stringify(row.original))
        toast.add({
          title: "Host JSON copied!",
          color: "success",
          icon: "i-lucide-circle-check",
        })
      },
    },
    { type: "separator" },
    { label: "Delete Host" },
  ]
}

const columns: TableColumn<ADHost>[] = [
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
    accessorKey: "ip",
    header: "IP Address",
  },
  {
    accessorKey: "hostname",
    header: "Hostname",
    cell: ({ row }) => row.original.hostname ?? "-",
  },
  {
    accessorKey: "created",
    header: "Created",
    cell: ({ row }) => {
      if (!row.original.created) return "-"
      return new Date(row.original.created).toLocaleDateString()
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
]
</script>


<template>
  <div class="min-h-[300px] relative">
    <div
      class="flex justify-end gap-2 px-4 py-3.5 border-b border-(--ui-border-accented)"
    >
      <UInput
        v-model="globalFilter"
        class="max-w-sm"
        placeholder="Filter hosts..."
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
                table?.tableApi?.getColumn(c.id)?.toggleVisibility(!!checked)
              },
              onSelect(e?: Event) {
                e?.preventDefault()
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
      Loaded {{ enrichedHosts.length }} hosts
    </div>

    <UTable
      ref="table"
      v-model:expanded="expanded"
      v-model:column-visibility="columnVisibility"
      v-model:global-filter="globalFilter"
      sticky
      :data="enrichedHosts"
      :columns="columns"
      :loading="isLoading"
      :ui="{ tr: 'data-[expanded=true]:bg-(--ui-bg-elevated)/50' }"
    >
      <template #expanded="{ row }">
        <OverviewHost
          :host="row.original"
          :domains="row.original.domains"
        />
      </template>
    </UTable>
  </div>
</template>
