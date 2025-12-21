<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui"
import { h, resolveComponent, computed, ref, onMounted } from "vue"
import type { ADService } from "~/types"

const currentProjectStore = useCurrentProjectStore()
const { fetchProjectHierarchy, enrichedHosts } = useProjectData()

const UButton = resolveComponent("UButton")

const expanded = ref<Record<string, boolean>>({})
const table = useTemplateRef("table")
const globalFilter = ref("")
const columnVisibility = ref({})
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  await fetchProjectHierarchy(currentProjectStore.getUID, {
    includeDomains: true,
    includeHosts: true,
    includeServices: true,
    skipCache: true,
  })
  loading.value = false
})

type ServiceRow = ADService & {
  hostUID: string
  hostIP: string
}

const serviceTableData = computed<ServiceRow[]>(() =>
  enrichedHosts.value.flatMap(host =>
    host.services.map(service => ({
      ...service,
      hostUID: host.uid,
      hostIP: host.ip ?? "-",
    }))
  )
)

const columns: TableColumn<ServiceRow>[] = [
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
            row.getIsExpanded() ? "rotate-180 duration-200" : "",
          ],
        },
        onClick: () => row.toggleExpanded(),
      }),
  },
  {
    accessorKey: "name",
    header: "Service",
  },
  {
    accessorKey: "hostIP",
    header: "Deployed On",
  },
  {
    accessorKey: "port",
    header: "Port",
  },
  {
    accessorKey: "protocol",
    header: "Protocol",
  },
  {
    accessorKey: "discoveredAt",
    header: "Discovered At",
    cell: ({ row }) => {
      if (!row.original.discoveredAt) return "-"
      return new Date(row.original.discoveredAt).toLocaleString("de-DE", {
        dateStyle: "short",
        timeStyle: "medium",
      })
    },
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
        placeholder="Filter services..."
      />
    </div>

    <div class="p-2 text-xs text-gray-600">
      Loaded {{ serviceTableData.length }} services
    </div>

    <UTable
      ref="table"
      v-model:expanded="expanded"
      v-model:global-filter="globalFilter"
      v-model:column-visibility="columnVisibility"
      sticky
      :data="serviceTableData"
      :columns="columns"
      :loading="loading"
      :ui="{ tr: 'data-[expanded=true]:bg-(--ui-bg-elevated)/50' }"
    >
      <template #expanded="{ row }">
        <OverviewService
          :service="row.original"
        />
      </template>
    </UTable>
  </div>
</template>
