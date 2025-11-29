import { defineStore } from "pinia";
import type { ADPwnModule } from "~/app/types/adpwn/ADPwnModule";
import type { ADPwnInheritanceGraph } from "~/app/types/adpwn/ADPwnModuleGraph";
import { useBaseStore, type BaseStoreState } from "~/composables/utils/useBaseStore";
import { useADPwnModuleApi } from "~/composables/api/useADwnModuleApi";
import type { ADPwnModuleOption } from "~/app/types/adpwn/ADPwnModuleOption";
import type { ADPwnModuleResponse } from "~/app/types/adpwn/ADpwnModuleResponse";
import type { ADPwnModuleParameters } from "~/app/types/adpwn/ADPwnModuleParameters";

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
    getModuleByKey: (state) => (key: string) =>
      state.modules.find((m) => m.key === key),
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

    async fetchAttackVectorOptions(moduleKey: string) {
      const { handleApiCall } = this._initBaseStore();
      let options: ADPwnModuleOption[] = [];
      await handleApiCall(
        () => {
          const api = useADPwnModuleApi();
          return api.getAttackVectorOptions(moduleKey);
        },
        (response) => {
          options = response.data ?? [];
        },
        {
          loadingRef: this.loading,
          errorRef: this.error,
        },
      );
      return options;
    },

    async fetchSingleModule(key: string) {
      if (this.modules.length === 0) {
        await this.fetchModules();
      }
      console.log("HI");
      console.log(JSON.stringify(this.modules));
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

    async runAttackVector(moduleKey: string, params: ADPwnModuleParameters[]): Promise<string> {
      console.log("EEEEEE");
      const { handleApiCall } = this._initBaseStore();
      let result = '';
      
      await handleApiCall(
        () => {
          const api = useADPwnModuleApi();
          return api.runAttackVector(moduleKey, params);
        },
        (response) => {
          result = response.data ?? '';
        }
      );
      
      return result;
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

    // Load dependencies for a single module
    async loadDependenciesForModule(moduleKey: string): Promise<ADPwnModule> {
      const module = await this.fetchSingleModule(moduleKey);

      console.log("Loading dependencies for module:", moduleKey);

      if (
        !module.dependency_vector_keys ||
        module.dependency_vector_keys.length === 0
      ) {
        // No dependencies to load
        module.dependency_vector = [];
        return module;
      }

      // Check if dependencies are already loaded
      if (
        module.dependency_vector &&
        module.dependency_vector.length === module.dependency_vector_keys.length
      ) {
        return module;
      }

      // Ensure all modules are loaded
      if (this.modules.length === 0) {
        await this.fetchModules();
      }

      // Find dependencies from the already loaded modules
      const dependencies: ADPwnModule[] = [];
      const missingDependencies: string[] = [];

      for (const depKey of module.dependency_vector_keys) {
        const depModule = this.modules.find((m) => m.key === depKey);

        if (depModule) {
          dependencies.push(depModule);
        } else {
          missingDependencies.push(depKey);
        }
      }

      // Try to load missing dependencies
      if (missingDependencies.length > 0) {
        // const { handleApiCall } = this._initBaseStore();
        // const api = useADPwnModuleApi();

        for (const depKey of missingDependencies) {
          dependencies.push(this.fetchSingleModule(depKey)); // Placeholder for missing module
          // try {
          //   await handleApiCall(
          //     () => api.getModuleByKey(depKey),
          //     (response) => {
          //       if (response.data) {
          //         const loadedModule = response.data as ADPwnModule;
          //         // Add to store
          //         if (!this.modules.some(m => m.key === loadedModule.key)) {
          //           this.modules.push(loadedModule);
          //         }
          //         dependencies.push(loadedModule);
          //       }
          //     }
          //   );
          // } catch (error) {
          //   console.error(`Failed to load dependency module: ${depKey}`, error);
          //   toast.error(`Abhängigkeit konnte nicht geladen werden: ${depKey}`);
          // }
        }
      }

      // Set dependencies
      module.dependency_vector = dependencies;
      return module;
    },

    // Load all modules with their dependencies
    async loadAllModulesWithDependencies() {
      await this.fetchModules();

      const loadedModules: ADPwnModule[] = [];

      for (const module of this.modules) {
        try {
          const moduleWithDeps = await this.loadDependenciesForModule(
            module.key,
          );
          loadedModules.push(moduleWithDeps);
        } catch (error) {
          console.error(
            `Failed to load dependencies for module: ${module.key}`,
            error,
          );
        }
      }

      return loadedModules;
    },

    // Get module with dependencies loaded
    async getModuleWithDependencies(key: string): Promise<ADPwnModule> {
      console.log("Getting module with dependencies:", key);
      return await this.loadDependenciesForModule(key);
    },

    // Reset store
    resetModules() {
      const { invalidateCache } = this._initBaseStore();
      this.$reset();
      invalidateCache(this.cache);
    },
  },
});
