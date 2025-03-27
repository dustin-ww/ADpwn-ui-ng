import { defineStore } from "pinia";
import { useProjectsApi } from "~/composables/api/useProjectsApi";
import type { ADTarget } from "~/types/ad/ADTarget";
import type { ADPwnProject } from "~/types/adpwn/ADPwnProject";

interface ProjectState {
  currentProject: {
    id: string;
    name: string;
    targets: ADTarget[];
  };
  projects: ADPwnProject[];
  loading: boolean;
  error: Error | null;
  currentProjectTargetsId: string;
}

export const useOldProjectStore = defineStore("project", {
  state: (): ProjectState => ({
    currentProject: {
      id: "",
      name: "",
      targets: [],
    },
    projects: [],
    loading: false,
    error: null,
    currentProjectTargetsId: "",
  }),

  getters: {
    projectID: (state) => state.currentProject.id,
    projectName: (state) => state.currentProject.name,
    hasProjects: (state) => state.projects.length > 0,
    projectTargets: (state) => state.currentProject.targets,
  },

  actions: {
    setProject(id: string, name?: string) {
      if (this.currentProject.id !== id) {
        // Reset targets when project changes
        this.currentProject.targets = [];
        this.currentProjectTargetsId = "";
      }
      this.currentProject.id = id;
      if (name) this.currentProject.name = name;
    },

    clearProject() {
      this.currentProject = {
        id: "",
        name: "",
        targets: [],
      };
      this.currentProjectTargetsId = "";
    },

    async fetchActualProjectTargets(force = false) {
      if (!this.currentProject.id) {
        this.error = new Error("Project ID is not set");
        throw this.error;
      }

      if (
        this.currentProjectTargetsId === this.currentProject.id &&
        this.currentProject.targets.length > 0 &&
        !force
      ) {
        return;
      }

      this.loading = true;
      this.error = null;

      try {
        const projectApi = useProjectsApi();
        const response = await projectApi.getTargets(this.currentProject.id);

        if (response.error) throw response.error;

        this.currentProject.targets = response.data as ADTarget[];
        this.currentProjectTargetsId = this.currentProject.id;
        return response.data;
      } catch (error) {
        this.error =
          error instanceof Error ? error : new Error("Unknown error");
        throw this.error;
      } finally {
        this.loading = false;
      }
    },

    async fetchProjects(force = false) {
      if (this.hasProjects && !force) return;

      this.loading = true;
      this.error = null;

      try {
        const projectApi = useProjectsApi();
        const response = await projectApi.getProjects();

        if (response.error) throw response.error;

        this.projects = response.data as ADPwnProject[];
        return response.data;
      } catch (error) {
        this.error =
          error instanceof Error ? error : new Error("Unknown error");
        throw this.error;
      } finally {
        this.loading = false;
      }
    },
  },
  persist: [
    {
      pick: ["currentProject"],
      storage: piniaPluginPersistedstate.localStorage(),
    },
  ],
});
