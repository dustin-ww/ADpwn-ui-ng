import { defineStore } from "pinia";
import { useProjectsApi } from "~/composables/api/useProjectsApi";
import type { ADPwnProject } from "~/types/adpwn/ADPwnProject";

interface ProjectsState {
  projectsFetched: boolean;
  list: ADPwnProject[];
  loading: boolean;
  error: Error | null;
}

export const useProjectsStore = defineStore("projects", {
  state: (): ProjectsState => ({
    list: [],
    loading: false,
    error: null,
    projectsFetched: false,
  }),
  getters: {
    getProjects: (state) => state.list,
  },

  actions: {
    async fetchProjects(force = false) {
      this.projectsFetched = true;
      console.log("Fetching projects...");
      if (this.list.length > 0 && !force) return;

      this.loading = true;
      try {
        const api = useProjectsApi();
        const response = await api.getProjects();
        if (response.error) throw response.error;
        this.list = response.data ?? [];
        console.log("Fetched projects:", this.list);
      } catch (error) {
        this.handleError(error);
      } finally {
        this.loading = false;
      }
    },

    async fetchSingleProject(id: string) {
      console.log("Fetching single project with ID:", id);
      try {
        const api = useProjectsApi();
        console.log("UIdD ", id);
        const response = await api.getProject(id);
        if (response.error) throw response.error;
        return response.data;
      } catch (error) {
        this.handleError(error);
      }
    },

    updateProject(updatedProject: ADPwnProject) {
      if (!this.projectsFetched) return;
      console.log("Updating project:", updatedProject.uid);
      try {
        const index = this.list.findIndex((p) => p.uid === updatedProject.uid);

        if (index === -1) {
          throw new Error(`Project with UID ${updatedProject.uid} not found`);
        }

        this.list = [
          ...this.list.slice(0, index),
          { ...this.list[index], ...updatedProject },
          ...this.list.slice(index + 1),
        ];
      } catch (error) {
        this.handleError(error);
        throw error;
      }
    },
    handleError(error: unknown) {
      this.error = error instanceof Error ? error : new Error(String(error));
    },
  },
});
