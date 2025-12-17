<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-4">Run History</h1>

    <div class="mb-6 space-x-2">
      <button
        @click="loadRuns"
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Load Runs
      </button>
      <button
        @click="clearRuns"
        class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
      >
        Clear
      </button>
    </div>

    <div v-if="loading" class="text-blue-600">Loading...</div>
    <div v-if="error" class="text-red-600 mb-4">Error: {{ error }}</div>

    <!-- Vector Runs -->
    <div
      v-if="!loading && historyStore.hasVectorRuns"
      class="space-y-6"
    >
      <h2 class="text-xl font-semibold">
        Vector Runs ({{ historyStore.vectorRuns.length }})
      </h2>

      <div
        v-for="vectorRun in historyStore.vectorRuns"
        :key="vectorRun.runUid"
        class="border rounded p-4"
      >
        <h3 class="text-lg font-semibold mb-2">
          Vector Run: {{ vectorRun.runUid }}
        </h3>

        <p><strong>Project UID:</strong> {{ vectorRun.projectUid }}</p>
        <p><strong>Ran At:</strong> {{ vectorRun.ranAt }}</p>

        <!-- Module Runs for this Vector -->
        <div
          v-if="historyStore.getModuleRunsWithVectorUID(vectorRun.runUid).length > 0"
          class="mt-4 space-y-3"
        >
          <h4 class="font-semibold">
            Module Runs ({{ historyStore.getModuleRunsWithVectorUID(vectorRun.runUid).length }})
          </h4>

          <div
            v-for="moduleRun in historyStore.getModuleRunsWithVectorUID(vectorRun.runUid)"
            :key="moduleRun.runUid"
            class="border p-3 rounded bg-red"
          >
            <p><strong>Module Key:</strong> {{ moduleRun.moduleKey }}</p>
            <p><strong>Ran At:</strong> {{ moduleRun.ranAt }}</p>
            <p><strong>Successful:</strong> {{ moduleRun.wasSuccessful }}</p>
          </div>
        </div>

        <div v-else class="mt-4 text-sm text-gray-500">
          No module runs for this vector run.
        </div>
      </div>
    </div>
  </div>
</template>


<script lang="ts" setup>
import { ref } from "vue";
import { useRPHistoryStore } from "~/stores/rpHistoryStore";

const historyStore = useRPHistoryStore();

const loading = ref(false);
const error = ref("");

// Projekt-UID (wie bei dir)
const currentProjectStore = useCurrentProjectStore();
const projectUID = currentProjectStore.getUID;

const loadRuns = async () => {
  loading.value = true;
  error.value = "";

  try {
    const [vectorRuns, moduleRuns] = await Promise.all([
      historyStore.fetchVectorRuns(projectUID),
      historyStore.fetchModuleRuns(projectUID),
    ]);

    historyStore.vectorRuns = vectorRuns;
    historyStore.moduleRuns = moduleRuns;
  } catch (e: any) {
    error.value = e.message || "Failed to load runs";
  } finally {
    loading.value = false;
  }
};

const clearRuns = () => {
  historyStore.resetModules();
  error.value = "";
};
</script>

