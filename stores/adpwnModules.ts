import { useADPwnModuleApi } from "~/composables/api/useADwnModuleApi";
import type { ADPwnModule } from "~/types/adpwn/ADPwnModule";
import type { ADPwnInheritanceGraph } from "~/types/adpwn/ADPwnModuleGraph";

type State = {
  modules: ADPwnModule[];
  graph: ADPwnInheritanceGraph;
};

export const useADPwnModuleStore = defineStore("adpwnModules", {
  state: (): State => ({
    modules: [] as ADPwnModule[],
    graph: {} as ADPwnInheritanceGraph,
  }),
  getters: {
    hasModules: (state) => {
      return state.modules.length > 0;
    },
    hasGraph: (state) => {
      return Object.keys(state.graph).length > 0;
    },
    modules: (state) => state.modules,
    graph: (state) => state.graph,
  },
  actions: {
    async fetchModules() {
      try {
        const api = useADPwnModuleApi();
        const response = await api.getModules();
        if (response.error) throw response.error;
        this.modules = response.data ?? [];
        return response.data;
      } catch (error) {
        console.error("Failed to fetch modules:", error);
        throw error;
      }
    },
    async fetchGraph() {
      try {
        const api = useADPwnModuleApi();
        const response = await api.getGraph();
        if (response.error) throw response.error;
        this.graph = response.data ?? { nodes: [], edges: [] };
        return response.data;
      } catch (error) {
        console.error("Failed to fetch graph:", error);
        throw error;
      }
    },
  },
  persist: true,
});
