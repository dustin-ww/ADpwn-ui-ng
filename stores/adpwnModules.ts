import { defineStore } from "pinia";
import type { ADPwnModule } from "~/types/adpwn/ADPwnModule";
import type { ADPwnInheritanceGraph } from "~/types/adpwn/ADPwnModuleGraph";
import { useBaseStore, type BaseStoreState } from "~/composables/useBaseStore";
import { useADPwnModuleApi } from "~/composables/api/useADwnModuleApi";
import { toast } from "#build/ui";

interface ADPwnModuleState extends BaseStoreState {
  modules: ADPwnModule[];
  graph: ADPwnInheritanceGraph;
}

export const useADPwnModuleStore = defineStore("adpwnModules", {
  state: (): ADPwnModuleState => ({
    modules: [],
    graph: { nodes: [], edges: [] },
    loading: false,
    error: null,
    cache: {
      modules: null,
      graph: null,
    },
  }),

  getters: {
    hasModules: (state) => state.modules.length > 0,
    hasGraph: (state) =>
      state.graph.nodes.length > 0 || state.graph.edges.length > 0,
    getModules: (state) => state.modules,
    getGraph: (state) => state.graph,
  },

  actions: {
    // Initialize the base store helpers
    _initBaseStore() {
      const baseStore = useBaseStore<ADPwnModuleState>("adpwnModules");
      const fetcher = baseStore.createFetcher<ADPwnModule>(this);
      const entityCreator = baseStore.createEntityCreator(this);

      return {
        ...baseStore,
        fetcher,
        entityCreator,
      };
    },

    async fetchSingleModule(key: string) {
      if (this.modules.length === 0) {
        await this.fetchModules();
      }
      const module = this.modules.find((m) => m.key === key);
      if (!module) {
        throw new Error(`Module with key ${key} not found`);
      }
      return module;
    },

    async fetchModules(force = false) {
      if (this.hasModules && !force) {
        const { isCacheValid } = this._initBaseStore();
        if (isCacheValid(this.cache.modules)) {
          return this.modules;
        }
      }

      const { fetcher } = this._initBaseStore();

      const fetchModulesWithCache = fetcher<"modules">(
        () => {
          const api = useADPwnModuleApi();
          return api.getModules();
        },
        "modules",
        (data) => {
          console.log("Fetched modules:", JSON.stringify(data));
          this.modules = data as ADPwnModule[];
        },
        { skipCache: force },
      );

      return await fetchModulesWithCache();
    },

    async fetchGraph(force = false) {
      if (this.hasGraph && !force) {
        const { isCacheValid } = this._initBaseStore();
        if (isCacheValid(this.cache.graph)) {
          return this.graph;
        }
      }

      const { handleApiCall } = this._initBaseStore();

      return await handleApiCall(
        () => {
          const api = useADPwnModuleApi();
          return api.getGraph();
        },
        (response) => {
          this.graph = response.data ?? { nodes: [], edges: [] };
          this.cache.graph = import.meta.client ? Date.now() : null;
        },
      );
    },

    resetModules() {
      const { invalidateCache } = this._initBaseStore();
      this.$reset();
      invalidateCache(this.cache);
    },
  },
});
