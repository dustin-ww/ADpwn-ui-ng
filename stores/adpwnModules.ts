import { useADPwnModuleApi } from "~/composables/api/useADwnModuleApi";
import type { ADPwnModule } from "~/types/adpwn/ADPwnModule";
import type { ADPwnInheritanceGraph } from "~/types/adpwn/ADPwnModuleGraph";

type State = {
  modules: ADPwnModule[];
  graph: ADPwnInheritanceGraph;
};

export const useADPwnModuleStore = defineStore("adpwnModules", {
  state: (): State => ({
    modules: [] as ADPwnModule[], // Ensure proper initialization
    graph: { nodes: [], edges: [] } as ADPwnInheritanceGraph, // Ensure consistent structure
  }),
  getters: {
    hasModules: (state) => {
      return state.modules.length > 0;
    },
    hasGraph: (state) => {
      return state.graph.nodes.length > 0 || state.graph.edges.length > 0; // Adjusted for consistency
    },
    // Removed duplicate getter names to avoid conflicts
    getModules: (state) => state.modules,
    getGraph: (state) => state.graph,
  },
  actions: {
    async fetchModules(force = false) {
      if (this.hasModules && !force) return;
      try {
        const api = useADPwnModuleApi();
        const response = await api.getModules();
        if (response.error) throw response.error;
        this.modules = Array.isArray(response.data) ? response.data : [];
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
        this.graph = response.data ?? { nodes: [], edges: [] }; // Ensure consistent structure
        return response.data;
      } catch (error) {
        console.error("Failed to fetch graph:", error);
        throw error;
      }
    },
    resetModules() {
      this.modules = []; // Zustand zurücksetzen
      this.graph = { nodes: [], edges: [] }; // Graph ebenfalls zurücksetzen
    },
  },
  persist: true,
});
