<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import { upperFirst } from 'scule'
import type { TableColumn } from '@nuxt/ui'
import { useInfiniteScroll } from '@vueuse/core'

const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
const currentProjectStore = useCurrentProjectStore();
const logStore = useLogsStore();

interface LogTableEntry {
  id: string;
  message: string;
  payload: string;
  timestamp: string;
  module_key: string;
  level: string;
  isSystemLog: boolean;
  event_type: string;
}

const allLogs = ref<LogTableEntry[]>([]);
const displayedLogs = ref<LogTableEntry[]>([]);
const batchSize = 50;
const currentIndex = ref(0);
const isLoadingMore = ref(false);
const expanded = ref({});
const columnVisibility = ref({});

onMounted(async () => {
  const result = await logStore.fetchLogs({ skipCache: true });
  console.log('Logs result:', result);
  
  allLogs.value = result.map((log_entry: ADPwnLogEntry) => ({
    id: log_entry.id,
    message: log_entry.message,
    payload: atob(log_entry.payload),
    timestamp: log_entry.timestamp,
    module_key: log_entry.moduleKey,
    level: log_entry.level,
    isSystemLog: log_entry.projectUID === "SYSTEM",
    event_type: log_entry.eventType,
  }));
  
  loadMoreLogs();
});

const loadMoreLogs = () => {
  if (isLoadingMore.value || currentIndex.value >= allLogs.value.length) return;
  
  isLoadingMore.value = true;
  const nextBatch = allLogs.value.slice(currentIndex.value, currentIndex.value + batchSize);
  displayedLogs.value = [...displayedLogs.value, ...nextBatch];
  currentIndex.value += batchSize;
  
  nextTick(() => {
    isLoadingMore.value = false;
  });
};

const columns: TableColumn<LogTableEntry>[] = [
  {
    id: 'expand',
    header: '',
    cell: ({ row }) =>
      h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        icon: 'i-lucide-chevron-down',
        square: true,
        'aria-label': 'Expand',
        ui: {
          leadingIcon: [
            'transition-transform',
            row.getIsExpanded() ? 'duration-200 rotate-180' : ''
          ]
        },
        onClick: () => row.toggleExpanded()
      })
  },
  {
    accessorKey: "id",
    header: ({ column }) => {
      const isSorted = column.getIsSorted()
      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'ID',
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
      })
    }
  },
  { accessorKey: "module_key", header: "Module Key" },
  { accessorKey: "event_type", header: "Event Type" },
  { accessorKey: "message", header: "Message" },
  {
    accessorKey: "timestamp",
    header: ({ column }) => {
      const isSorted = column.getIsSorted()
      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Timestamp',
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
      })
    },
    cell: ({ row }) => {
      return new Date(row.getValue('timestamp')).toLocaleString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    }
  },
  { accessorKey: "level", header: "Level" },
];

const columnFilters = ref([{ message: "", value: "" }]);
const sorting = ref([
  {
    id: 'timestamp',
    desc: true
  }
]);

const table = useTemplateRef("table");
const scrollContainer = useTemplateRef("scrollContainer");

onMounted(() => {
  if (scrollContainer.value) {
    useInfiniteScroll(
      scrollContainer.value,
      () => {
        loadMoreLogs();
      },
      {
        distance: 200,
        canLoadMore: () => {
          return !isLoadingMore.value && currentIndex.value < allLogs.value.length;
        }
      }
    )
  }
});
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center gap-4">
      <UInput
        :model-value="table?.tableApi?.getColumn('message')?.getFilterValue() as string"
        class="max-w-sm flex-1"
        placeholder="Filter Messages..."
        @update:model-value="table?.tableApi?.getColumn('message')?.setFilterValue($event)"
      />
      <UDropdownMenu
        :items="
          table?.tableApi
            ?.getAllColumns()
            .filter((column) => column.getCanHide())
            .map((column) => ({
              label: upperFirst(column.id.replace('_', ' ')),
              type: 'checkbox' as const,
              checked: column.getIsVisible(),
              onUpdateChecked(checked: boolean) {
                table?.tableApi?.getColumn(column.id)?.toggleVisibility(!!checked)
              },
              onSelect(e: Event) {
                e.preventDefault()
              }
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
    <div class="border rounded-lg overflow-hidden">
      <div ref="scrollContainer" class="max-h-[600px] overflow-y-auto">
        <UTable
          ref="table"
          v-model:column-filters="columnFilters"
          v-model:sorting="sorting"
          v-model:expanded="expanded"
          v-model:column-visibility="columnVisibility"
          :data="displayedLogs"
          :columns="columns"
          :loading="currentProjectStore.loading || isLoadingMore"
          :ui="{ tr: 'data-[expanded=true]:bg-elevated/50' }"
        >
          <template #event_type-cell="{ row }">
            <UBadge v-if="row.original.event_type === 'run_complete'" color="success" variant="outline">Run completed</UBadge>
            <UBadge v-if="row.original.event_type === 'scan_start'" color="neutral" variant="outline">Scan started</UBadge>
            <UBadge v-if="row.original.event_type === 'run_start'" color="neutral">Run started</UBadge>
            <UBadge v-if="row.original.event_type === 'module_complete'" color="success">Module completed</UBadge>
          </template>
          
          <template #expanded="{ row }">
            <div class="p-4 bg-gray-50 dark:bg-gray-800/50">
              <div class="space-y-2">
                <div>
                  <strong class="text-sm font-semibold">Payload:</strong>
                  <pre class="mt-1 p-2 bg-white dark:bg-gray-900 rounded text-xs overflow-x-auto">{{ row.original.payload }}</pre>
                </div>
                <div>
                  <strong class="text-sm font-semibold">System Log:</strong>
                  <span class="ml-2">{{ row.original.isSystemLog ? 'Yes' : 'No' }}</span>
                </div>
                <div>
                  <strong class="text-sm font-semibold">Full Details:</strong>
                  <pre class="mt-1 p-2 bg-white dark:bg-gray-900 rounded text-xs overflow-x-auto">{{ row.original }}</pre>
                </div>
              </div>
            </div>
          </template>
        </UTable>
      </div>
      <div v-if="currentProjectStore.error" class="mt-4 p-4 text-red-500">
        Error: {{ currentProjectStore.error.message }}
      </div>
      <div v-if="displayedLogs.length > 0 && displayedLogs.length < allLogs.length" class="p-2 text-center text-sm text-gray-500 border-t">
        Showing {{ displayedLogs.length }} of {{ allLogs.length }} logs
      </div>
    </div>
  </div>
</template>