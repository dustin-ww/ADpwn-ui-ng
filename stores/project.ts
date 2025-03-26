// stores/project.ts
import { defineStore } from "pinia";
import { useProjectsApi } from "~/composables/api/useProjectsApi";
import type { ADPwnProject } from "~/types/adpwn/ADPwnProject";

export const useProjectStore = defineStore("project", {
  state: () => ({
    currentProject: {
      id: "",
      name: "",
    },
    projects: [] as ADPwnProject[],
    loading: false,
  }),
  getters: {
    projectID: (state) => state.currentProject.id,
    projectName: (state) => state.currentProject.name,
    hasProjects: (state) => {
      return state.projects.length > 0;
    },
  },
  actions: {
    setProject(id: string, name: string) {
      this.currentProject.id = id;
      this.currentProject.name = name;
    },
    clearProject() {
      this.currentProject.id = "";
      this.currentProject.name = "";
    },
    async fetchProjects(force = false) {
      if (this.hasProjects && !force) return;
      this.loading = true;
      try {
        const projectApi = useProjectsApi();
        const response = await projectApi.getProjects();

        if (response.error) throw response.error;

        this.projects = response.data;
        return response.data;
      } catch (error) {
        console.error("Failed to fetch projects:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    persist: [
      {
        pick: ["currentProject"],
        storage: piniaPluginPersistedstate.localStorage(),
      },
    ],
  },
});
