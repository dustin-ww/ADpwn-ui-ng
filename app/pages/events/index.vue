<script setup lang="ts">
import type { LogQueryOptionsSchema } from '~/types/log-query'; // Passe den Import-Pfad an

useHead({
  title: "Log Explorer • ADPwn",
});

const currentProjectStore = useCurrentProjectStore();
const logStore = useLogsStore();

// Filter States
const selectedLogType = ref<string[]>([]);
const selectedModuleKeys = ref<string[]>([]);
const showSystemLogs = ref(false);
const messageFilter = ref('');
const startTime = ref<string>('');
const endTime = ref<string>('');

const logTypes = ref<string[]>([]);
const moduleKeys = ref<string[]>([]);
const pending = ref(false);
const error = ref<Error | null>(null);

// Ref für die ListLogs Komponente
const listLogsRef = ref();

onMounted(async () => {
  pending.value = true;
  error.value = null;
  try {
    const types = await logStore.fetchLogTypes({ skipCache: true });
    const mkeys = await logStore.fetchLogModuleKeys({ skipCache: true });
    
    logTypes.value = Array.isArray(types)
      ? types.filter(t => t && t.trim() !== '')
      : [];
    moduleKeys.value = Array.isArray(mkeys)
      ? mkeys.filter(mk => mk && mk.trim() !== '')
      : [];
  } catch (e) {
    console.error('Error fetching log types:', e);
    error.value = e as Error;
  } finally {
    pending.value = false;
  }
});

// Query Schema zusammenbauen
const buildQuerySchema = (): LogQueryOptionsSchema => {
  const query: LogQueryOptionsSchema = {
    page: 1,
    pageSize: 100, // Initiale Ladegröße
    sortBy: 'timestamp',
    sortOrder: 'DESC'
  };

  // Optional: Search Term
  if (messageFilter.value && messageFilter.value.trim() !== '') {
    query.searchTerm = messageFilter.value.trim();
  }

  // Optional: Event Types
  if (selectedLogType.value && selectedLogType.value.length > 0) {
    query.eventTypes = selectedLogType.value;
  }

  // Optional: Module Keys
  if (selectedModuleKeys.value && selectedModuleKeys.value.length > 0) {
    query.moduleKeys = selectedModuleKeys.value;
  }

  // Optional: Time Range
  if (startTime.value) {
    query.startTime = startTime.value;
  }
  if (endTime.value) {
    query.endTime = endTime.value;
  }

  return query;
};

// Search Handler
const handleSearch = () => {
  const query = buildQuerySchema();
  console.log('Searching with query:', query);
  
  if (listLogsRef.value) {
    listLogsRef.value.fetchWithQuery(query);
  }
};

// Optional: Reset Filter
const resetFilters = () => {
  selectedLogType.value = [];
  selectedModuleKeys.value = [];
  showSystemLogs.value = false;
  messageFilter.value = '';
  startTime.value = '';
  endTime.value = '';
};
</script>

<template>
  <div class="me-8">
    <SharedHeading heading="Log Explorer" />
    <div class="ml-5">
      <UCollapsible class="flex flex-col gap-2 min-w-80">
    <UButton
      class="group min-w-80"
      label="Advanced Search"
      color="neutral"
      variant="subtle"
      trailing-icon="i-lucide-chevron-down"
      :ui="{
        trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200'
      }"
      block
    />

    <template #content>


      <div class="grid grid-cols-3 gap-4 items-center">
        <USelectMenu
          v-model="selectedLogType"
          icon="i-lucide-search"
          size="md"
          multiple
          :items="logTypes"
          :loading="pending"
          :disabled="pending"
          placeholder="Filter log types..."
        />
        <USelectMenu
          v-model="selectedModuleKeys"
          icon="i-lucide-search"
          size="md"
          class="ms-8"
          multiple
          :items="moduleKeys"
          :loading="pending"
          :disabled="pending"
          placeholder="Filter module keys..."
        />
        <USwitch v-model="showSystemLogs" label="Show System Logs" />
      </div>
      <div class="grid grid-cols-2 gap-4 mt-4">
        <UInput
          v-model="startTime"
          type="datetime-local"
          size="md"
          placeholder="Start Time"
          icon="i-lucide-calendar"
        />
        <UInput
          v-model="endTime"
          type="datetime-local"
          size="md"
          placeholder="End Time"
          icon="i-lucide-calendar"
        />
      </div>
    </template>
  </UCollapsible>
    
    <div class="space-y-6 mt-10">
      <!-- Search Row -->
      <div class="grid grid-cols-2 gap-4">
        <UInput 
          v-model="messageFilter"
          size="xl" 
          placeholder="Filter Messages..."
          icon="i-lucide-search"
          @keydown.enter="handleSearch"
        />
        <div class="flex gap-2">
          <UButton 
            icon="i-lucide-rocket" 
            size="xl" 
            color="primary" 
            variant="solid"
            class="flex-1"
            @click="handleSearch"
          >
            Search
          </UButton>
          <UButton 
            icon="i-lucide-x" 
            size="xl" 
            color="neutral" 
            variant="outline"
            @click="resetFilters"
          >
            Reset
          </UButton>
          <UButton icon="i-lucide-rocket" color="success">
        Filter Exploration
      </UButton>
        </div>
      </div>
    </div>

    <div v-if="error" class="text-red-500 mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
      Error loading log types: {{ error.message }}
    </div>

    <div class="mt-6">
      <ListLogs ref="listLogsRef" :show-system-logs="showSystemLogs" />
    </div>
    </div>
      </div>
</template>