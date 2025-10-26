<script setup lang="ts">
import { h, resolveComponent, computed, watch, onMounted } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { LogQueryOptionsSchema } from '~/types/log-query'

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

const props = defineProps<{
  showSystemLogs?: boolean;
}>();

const logs = ref<LogTableEntry[]>([]);
const isLoading = ref(false);
const expanded = ref({});
const columnVisibility = ref({});
const currentQuery = ref<LogQueryOptionsSchema | null>(null);

const pagination = ref({
  pageIndex: 0,
  pageSize: 50
});

const totalCount = ref(0);
const totalPages = ref(0);

const pageCount = computed(() => {
  return Math.ceil(totalCount.value / pagination.value.pageSize)
});

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
    header: 'ID',
    cell: ({ row }) => `#${row.getValue('id')}`
  },
  { accessorKey: "module_key", header: "Module Key" },
  { accessorKey: "event_type", header: "Event Type" },
  {
    accessorKey: "message",
    header: "Message",
    cell: ({ row }) => {
      const message = row.getValue('message') as string;
      return h('div', { class: 'max-w-md truncate' }, message);
    }
  },
  {
    accessorKey: "timestamp",
    header: 'Timestamp',
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
  {
    accessorKey: "level",
    header: "Level",
    cell: ({ row }) => {
      const level = row.getValue('level') as string;
      const levelColors: Record<string, string> = {
        'error': 'red',
        'warn': 'yellow',
        'info': 'blue',
        'debug': 'gray'
      };
      return h(UBadge, {
        color: levelColors[level?.toLowerCase()] || 'gray',
        variant: 'subtle'
      }, () => level);
    }
  },
];

const columnFilters = ref([]);
const sorting = ref([
  {
    id: 'timestamp',
    desc: true
  }
]);

const fetchWithQuery = async (query: LogQueryOptionsSchema) => {
  isLoading.value = true;
  currentQuery.value = query;

  try {
    const result = await logStore.fetchLogsWithQuery(query);

    const logsArray = result.Logs || result.logs || [];
    totalCount.value = result.TotalCount || result.totalCount || 0;
    totalPages.value = result.TotalPages || result.totalPages || 0;

    logs.value = logsArray.map((log_entry: any) => ({
      id: log_entry.id || log_entry.ID,
      message: log_entry.message || log_entry.Message || '',
      payload: log_entry.payload || log_entry.Payload ? atob(log_entry.payload || log_entry.Payload) : '',
      timestamp: log_entry.timestamp || log_entry.Timestamp,
      module_key: log_entry.moduleKey || log_entry.module_key || log_entry.ModuleKey || '',
      level: log_entry.level || log_entry.Level || '',
      isSystemLog: (log_entry.projectUID || log_entry.ProjectUID || log_entry.project_uid) === "SYSTEM",
      event_type: log_entry.eventType || log_entry.event_type || log_entry.EventType || '',
    }));

    if (!props.showSystemLogs) {
      logs.value = logs.value.filter(log => !log.isSystemLog);
    }
  } catch (error) {
    logs.value = [];
    totalCount.value = 0;
    totalPages.value = 0;
  } finally {
    isLoading.value = false;
  }
};

const loadInitialLogs = async () => {
  const initialQuery: LogQueryOptionsSchema = {
    page: 1,
    pageSize: pagination.value.pageSize,
    sortBy: 'timestamp',
    sortOrder: 'DESC'
  };

  await fetchWithQuery(initialQuery);
};

onMounted(async () => {
  await loadInitialLogs();
});

// Pagination Watches
watch(() => pagination.value.pageIndex, async (newPageIndex, oldPageIndex) => {
  if (!currentQuery.value || oldPageIndex === undefined) return;

  const updatedQuery = {
    ...currentQuery.value,
    page: newPageIndex + 1,
    pageSize: pagination.value.pageSize
  };

  await fetchWithQuery(updatedQuery);
});

watch(() => pagination.value.pageSize, async (newPageSize, oldPageSize) => {
  if (!currentQuery.value || oldPageSize === undefined) return;

  pagination.value.pageIndex = 0;

  const updatedQuery = {
    ...currentQuery.value,
    page: 1,
    pageSize: newPageSize
  };

  await fetchWithQuery(updatedQuery);
});

watch(sorting, async (newSort, oldSort) => {
  if (!currentQuery.value) return;

  const sort = newSort[0];
  const updatedQuery = {
    ...currentQuery.value,
    sortBy: sort?.id || 'timestamp',
    sortOrder: sort?.desc ? 'DESC' : 'ASC',
    page: pagination.value.pageIndex + 1,
    pageSize: pagination.value.pageSize
  };

  await fetchWithQuery(updatedQuery)
});

watch(() => props.showSystemLogs, async (newVal, oldVal) => {
  if (!currentQuery.value || oldVal === undefined) return;
  await fetchWithQuery(currentQuery.value);
});

defineExpose({
  fetchWithQuery,
  loadInitialLogs
});
</script>

<template>
  <div class="space-y-4 overflow-visible">
    <div v-if="isLoading && logs.length === 0" class="border rounded-lg overflow-hidden">
      <div class="p-12 text-center">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p class="text-sm text-gray-500 dark:text-gray-400">Loading logs...</p>
      </div>
    </div>

    <div v-else class="border rounded-lg overflow-hidden">
      <UTable
        ref="table"
        v-model:column-filters="columnFilters"
        v-model:sorting="sorting"
        v-model:expanded="expanded"
        v-model:column-visibility="columnVisibility"
        v-model:pagination="pagination"
        :data="logs"
        :columns="columns"
        :loading="isLoading"
        :pagination-options="{
          pageCount: pageCount
        }"
        :ui="{ tr: 'data-[expanded=true]:bg-elevated/50' }"
      >
        <template #event_type-cell="{ row }">
          <UBadge :color="row.original.event_type === 'run_complete' ? 'success' : 'neutral'" variant="outline">
            {{ row.original.event_type }}
          </UBadge>
        </template>

        <template #expanded="{ row }">
          <div class="p-4 bg-gray-50 dark:bg-gray-800/50">
            <div class="space-y-3">
              <div>
                <strong>Full Message:</strong>
                <p>{{ row.original.message }}</p>
              </div>
              <div v-if="row.original.payload">
                <strong>Payload:</strong>
                <pre class="mt-1 p-3 bg-white dark:bg-gray-900 rounded-md text-xs overflow-x-auto border">
{{ row.original.payload }}
                </pre>
              </div>
            </div>
          </div>
        </template>
      </UTable>

      <div v-if="currentProjectStore.error" class="p-4 bg-red-50 border-t">
        {{ currentProjectStore.error.message }}
      </div>

      <div v-if="!isLoading && logs.length === 0 && currentQuery" class="p-12 text-center">
        <h3 class="text-lg font-semibold mb-2">No logs found</h3>
        <p class="text-sm text-gray-500">Try adjusting your filters</p>
      </div>
    </div>

    <div v-if="logs.length > 0" class="flex items-center justify-between">
      <div class="text-sm text-gray-600 dark:text-gray-400">
        Showing {{ (pagination.pageIndex * pagination.pageSize) + 1 }}
        to {{ Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalCount) }}
        of {{ totalCount }} logs
      </div>

      <UPagination
        :page="pagination.pageIndex + 1"
        :items-per-page="pagination.pageSize"
        :total="totalCount"
        @update:page="(p) => pagination.pageIndex = p - 1"
      />

      <USelectMenu
        v-model="pagination.pageSize"
        :items="[10, 25, 50, 100]"
        class="w-20"
        size="sm"
      >
        <template #label>
          {{ pagination.pageSize }}
        </template>
      </USelectMenu>
    </div>
  </div>
</template>
