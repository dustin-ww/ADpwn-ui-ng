import { defineStore } from "pinia";
import { useProjectsApi } from "~/composables/api/useProjectsApi";
import type { ADTarget } from "~/types/ad/ADTarget";
import { useProjectsStore } from "./projects";
import type { ProjectUpdateSchema } from "~/schemas/project";
import type { TargetSchema } from "~/schemas/target";
import type { ADDomain } from "~/types/ad/ADDomain";
import { useDomainsApi } from "~/composables/api/useDomainsApi";

interface CurrentProjectState {
  uid: string;
  name: string;
  description: string;
  targets: ADTarget[];
  domains: ADDomain[];
  loading: boolean;
  error: Error | null;
  cache: {
    domains: number | null; // Timestamp of last fetch
    targets: number | null; // Timestamp of last fetch
  };
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
    cache: {
      domains: null,
      targets: null,
    },
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

    async fetchDomains() {
      const cacheDuration = 5 * 60 * 1000; // 5 minutes
      if (isCacheValid(this.cache.domains, cacheDuration)) {
        console.log("Using cached domains");
        return;
      }

      await handleApiCall(
        async () => {
          const api = useDomainsApi();
          return await api.getDomainsByProjectUID(this.uid);
        },
        (response) => {
          this.domains = response.data ?? [];
          this.cache.domains = Date.now(); // Update cache timestamp
        },
        (error) => this.handleError(error),
        { value: this.loading }
      );
    },

    async fetchTargets() {
      const cacheDuration = 5 * 60 * 1000; // 5 minutes
      if (isCacheValid(this.cache.targets, cacheDuration)) {
        console.log("Using cached targets");
        return;
      }

      await handleApiCall(
        async () => {
          const api = useProjectsApi();
          return await api.getTargets(this.uid);
        },
        (response) => {
          this.targets = response.data ?? [];
          this.cache.targets = Date.now(); // Update cache timestamp
        },
        (error) => this.handleError(error),
        { value: this.loading }
      );
    },

    async createTarget(targetData: TargetSchema) {
      await handleApiCall(
        async () => {
          const api = useProjectsApi();
          return await api.createTarget(this.uid, targetData);
        },
        (response) => {
          if (response.data) {
            this.targets.push(response.data);
            this.cache.targets = null; // Invalidate targets cache
          } else {
            throw new Error("Target creation response is undefined");
          }
        },
        (error) => this.handleError(error),
        { value: this.loading }
      );
    },

    async updateProject(payload: ProjectUpdateSchema) {
      await handleApiCall(
        async () => {
          const api = useProjectsApi();
          return await api.updateProject(this.uid, payload);
        },
        () => {
          this.name = payload.name ?? this.name;
          this.description = payload.description ?? this.description;

          const projectsStore = useProjectsStore();
          projectsStore.updateProject({
            uid: this.uid,
            ...payload,
          });

          this.cache.domains = null; // Invalidate domains cache
          this.cache.targets = null; // Invalidate targets cache
        },
        (error) => this.handleError(error),
        { value: this.loading }
      );
    },

    reset() {
      this.$reset();
      this.cache = { domains: null, targets: null }; // Clear cache
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
