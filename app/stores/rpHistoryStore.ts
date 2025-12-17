import { defineStore } from "pinia";
import { useBaseStore, type BaseStoreState } from "~/composables/utils/useBaseStore";
import type { RPModuleRun } from "~/types/adpwn/history/RPModuleRun";
import type { RPVectorRun } from "~/types/adpwn/history/RPVectorRun";
import { usePRHistoryApi } from "~/composables/api/useRPHistoryApi";

interface RPHistoryState extends BaseStoreState {
  moduleRuns: RPModuleRun[];
  vectorRuns: RPVectorRun[];
}

export const useRPHistoryStore = defineStore("rpHistory", {
  state: (): RPHistoryState => ({
    moduleRuns: [],
    vectorRuns: [],
    loading: false,
    error: null,
    cache: {
      moduleRuns: null,
      vectorRuns: null,
    },
  }),

  getters: {
    hasModuleRuns: (state) => state.moduleRuns.length > 0,
    hasVectorRuns: (state) => state.vectorRuns.length > 0,
    getModuleRuns: (state) => state.moduleRuns,
    getVectorRuns: (state) => state.vectorRuns,
    getModuleRunsWithVectorUID: (state) => (vectorRunUid: string) =>
      state.moduleRuns.filter((mr) => mr.vectorRunUid === vectorRunUid),
  },

  actions: {
    _initBaseStore() {
    const baseStore = useBaseStore<RPHistoryState>("rpHistory");

    const moduleRunFetcher = baseStore.createFetcher<RPModuleRun>(this);
    const moduleRunCreator = baseStore.createEntityCreator(this);

    const vectorRunFetcher = baseStore.createFetcher<RPVectorRun>(this);
    const vectorRunCreator = baseStore.createEntityCreator(this);

    return {
      ...baseStore,
      moduleRunFetcher,
      moduleRunCreator,
      vectorRunFetcher,
      vectorRunCreator,
    };
  },

    async fetchModuleRuns(projectUID: string) {
      const { handleApiCall } = this._initBaseStore();
      let moduleRuns: RPModuleRun[] = [];
      console.log("Fetching module runs for project UID:", projectUID);
      await handleApiCall(
  
        () => {
          const api = usePRHistoryApi();
          return api.getModuleRuns(projectUID);
        },
        (response) => {
          moduleRuns = response.data ?? [];
        },
      );
      return moduleRuns;
    },

    async fetchVectorRuns(projectUID: string) {
      const { handleApiCall } = this._initBaseStore();
      let vectorRuns: RPVectorRun[] = [];
      console.log("Fetching vector runs for project UID:", projectUID);
      await handleApiCall(
  
        () => {
          const api = usePRHistoryApi();
          return api.getVectorRuns(projectUID);
        },
        (response) => {
          vectorRuns = response.data ?? [];
        },
      );
      return vectorRuns;
    },

    // Reset store
    resetModules() {
      const { invalidateCache } = this._initBaseStore();
      this.$reset();
      invalidateCache(this.cache);
    },
  },
});
