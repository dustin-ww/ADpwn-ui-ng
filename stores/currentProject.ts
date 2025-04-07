import { defineStore } from "pinia";
import type { ADTarget } from "~/types/ad/ADTarget";
import type { ProjectUpdateSchema } from "~/schemas/project";
import type { TargetSchema } from "~/schemas/target";
import { useBaseStore, type BaseStoreState } from "~/composables/useBaseStore";
import { useDomainsApi } from "~/composables/api/useDomainsApi";
import { useProjectsApi } from "~/composables/api/useProjectsApi";
import type { ADDomain } from "~/types/ad/ADDomain";

interface CurrentProjectState extends BaseStoreState {
  uid: string;
  name: string;
  description: string;
  targets: ADTarget[];
  domains: ADDomain[];
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
    // Initialize the base store helpers
    _initBaseStore() {
      const baseStore = useBaseStore<CurrentProjectState>("currentProject");
      const fetcher = baseStore.createFetcher(this);
      const entityCreator = baseStore.createEntityCreator(this);
      
      return {
        ...baseStore,
        fetcher,
        entityCreator
      };
    },

    async initialize(projectId: string, projectName: string) {
      this.reset();
      this.uid = projectId;
      this.name = projectName;

      await Promise.all([this.fetchProjectDetails(), this.fetchTargets()]);
      
      if (import.meta.client) {
        this.fetchDomains();
      }
    },

    async fetchProjectDetails() {
      const projectsStore = useProjectsStore();
      const project = await projectsStore.fetchSingleProject(this.uid);
      if (project) {
        this.name = project.name;
        this.description = project.description;
      }
    },

    async fetchDomains() {
      const { fetcher } = this._initBaseStore();
      
      const fetchDomainsWithCache = fetcher(
        () => {
          const api = useDomainsApi();
          return api.getDomainsByProjectUID(this.uid);
        },
        'domains',
        (data: ADDomain[]) => { this.domains = data; }
      );
      
      await fetchDomainsWithCache();
    },

    async fetchTargets() {
      const { fetcher } = this._initBaseStore();
      
      const fetchTargetsWithCache = fetcher(
        () => {
          const api = useProjectsApi();
          return api.getTargets(this.uid);
        },
        'targets',
        (data: ADTarget[]) => { this.targets = data; }
      );
      
      await fetchTargetsWithCache();
    },

    async createDomain(domainData: ADDomain) {
      const { entityCreator } = this._initBaseStore();
      
      const createDomainEntity = entityCreator(
        () => {
          const api = useDomainsApi();
          console.log("Creating domain with data:", JSON.stringify(domainData));
          return api.createDomain(this.uid, domainData);
        },
        'domains',
        this.domains,
        { successToast: true }
      );
      
      await createDomainEntity();
    },

    async createTarget(targetData: TargetSchema) {
      const { entityCreator } = this._initBaseStore();
      
      const createTargetEntity = entityCreator(
        () => {
          const api = useProjectsApi();
          return api.createTarget(this.uid, targetData);
        },
        'targets',
        this.targets,
        { successToast: true }
      );
      
      await createTargetEntity();
    },

    async updateProject(payload: ProjectUpdateSchema) {
      const { handleApiCall, invalidateCache } = this._initBaseStore();
      
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

          invalidateCache(this.cache);
          
          const toast = useToast();
          toast.add({
            title: 'Success',
            description: 'Project updated successfully.',
            color: 'success',
          });
        }
      );
    },

    reset() {
      const { invalidateCache } = this._initBaseStore();
      this.$reset();
      invalidateCache(this.cache);
    },
  },

  persist: [
    {
      pick: ["uid", "name", "description"],
      storage: import.meta.client
        ? {
            getItem: (key: string) => {
              const cookie = useCookie(key);
              return cookie.value;
            },
            setItem: (key: string, value: string) => {
              const cookie = useCookie(key, { path: "/" });
              cookie.value = value;
            },
            removeItem: (key: string) => {
              const cookie = useCookie(key);
              cookie.value = null;
            },
          }
        : undefined,
    },
  ],
  
});