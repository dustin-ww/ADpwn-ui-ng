import { defineStore } from "pinia";
import { useProjectsApi } from "~/composables/api/useProjectsApi";
import type { ADTarget } from "~/types/ad/ADTarget";
import { useProjectsStore } from "./projects";
import type { ProjectUpdateSchema } from "~/schemas/project";
import type { TargetSchema } from "~/schemas/target";
import type { ADDomain } from "~/types/ad/ADDomain";

interface CurrentProjectState {
  uid: string;
  name: string;
  description: string;
  targets: ADTarget[];
  domains: ADDomain[];
  loading: boolean;
  error: Error | null;
}

export const useCurrentProjectStore = defineStore("currentProject", {
  state: (): CurrentProjectState => ({
    uid: "",
    name: "",
    description: "",
    targets: [],
    domains: [],
    loading: false,
    error: null,
  }),

  getters: {
    hasTargets: (state) => state.targets.length > 0,
    hasDomains: (state) => state.domains.length > 0,
    getTargets: (state) => state.targets,
    getDomains: (state) => state.domains,
    getUID: (state) => state.uid,
    getName: (state) => state.name,
    getDescription: (state) => state.description,
  },

  actions: {
    async initialize(projectId: string, projectName: string) {
      console.log("INIT WITH", projectId, projectName);
      if (this.uid === projectId) return;

      this.reset();
      this.uid = projectId;
      this.name = projectName;

      await Promise.all([this.fetchProjectDetails(), this.fetchTargets()]);
    },

    async fetchProjectDetails() {
      const projectsStore = useProjectsStore();
      const project = await projectsStore.fetchSingleProject(this.uid);
      if (project) this.name = project.name;
    },

    // async fetchDomains(force = false) {
    //   if (this.domains.length > 0 && !force) return;
    //   this.loading = true;
    //   try {
    //     const api = useProjectsApi();
    //     const response = await api.getDomains(this.uid);

    async fetchTargets(force = false) {
      if (this.targets.length > 0 && !force) return;

      this.loading = true;
      try {
        const api = useProjectsApi();
        const response = await api.getTargets(this.uid);
        if (response.error) throw response.error;
        this.targets = response.data ?? [];
      } catch (error) {
        this.handleError(error);
      } finally {
        this.loading = false;
      }
    },

    async createTarget(targetData: TargetSchema) {
      this.loading = true;
      try {
        const api = useProjectsApi();
        const response = await api.createTarget(this.uid, targetData);

        if (response.error) {
          throw response.error;
        }

        if (response.data) {
          this.targets.push(response.data);
        } else {
          throw new Error("Target creation response is undefined");
        }

        console.log("Target created successfully", response.data);
        return { success: true };
      } catch (error) {
        this.handleError(
          error instanceof Error ? error : new Error("Target creation failed"),
        );
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateProject(payload: ProjectUpdateSchema) {
      try {
        this.loading = true;
        const api = useProjectsApi();

        const { error } = await api.updateProject(this.uid, payload);

        if (error) {
          throw error;
        }

        this.name = payload.name ?? this.name;
        this.description = payload.description ?? this.description;

        const projectsStore = useProjectsStore();
        projectsStore.updateProject({
          uid: this.uid,
          ...payload,
        });

        console.log("Project updated successfully", payload);
        return { success: true };
      } catch (error) {
        this.handleError(
          error instanceof Error ? error : new Error("Update failed"),
        );
        throw error;
      } finally {
        this.loading = false;
      }
    },

    reset() {
      this.$reset();
    },

    handleError(error: unknown) {
      this.error = error instanceof Error ? error : new Error(String(error));
    },
  },

  
persist: [
  {
    pick: ["uid", "name"],
    storage: {
      getItem: (key: string) => {
        const cookie = useCookie(key);
        return cookie.value;
      },
      setItem: (key: string, value: string) => {
        const cookie = useCookie(key, { path: '/' });
        cookie.value = value;
      },
      removeItem: (key: string) => {
        const cookie = useCookie(key);
        cookie.value = null;
      }
    }
  }
]
});
