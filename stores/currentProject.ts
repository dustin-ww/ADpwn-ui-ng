import { defineStore } from "pinia";
import type { ADTarget } from "~/types/ad/ADTarget";
import type { ProjectUpdateSchema } from "~/schemas/project";
import type { TargetSchema } from "~/schemas/target";
import { useBaseStore, type BaseStoreState } from "~/composables/useBaseStore";
import { useDomainsApi } from "~/composables/api/useDomainsApi";
import { useProjectsApi } from "~/composables/api/useProjectsApi";
import type { ADDomain } from "~/types/ad/ADDomain";
import type { ADPwnLogEntry } from "~/types/adpwn/ADPwnLogEntry";

interface CurrentProjectState extends BaseStoreState {
  uid: string;
  name: string;
  description: string;
  targets: ADTarget[];
  domains: ADDomain[];
  isHydrated: boolean;
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
    isHydrated: false,
  }),

  getters: {
    hasTargets: (state) => state.targets.length > 0,
    hasDomains: (state) => state.domains.length > 0,
    getTargets: (state) => state.targets,
    getDomains: (state) => state.domains,
    getUID: (state) => state.uid,
    getName: (state) => state.name,
    getDescription: (state) => state.description,
    hasProject: (state) => state.uid !== "",
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
        entityCreator,
      };
    },

    async hydrate() {
      if (this.isHydrated) return;

      if (import.meta.client) {
        this.isHydrated = true;
      } else if (import.meta.server) {
        const uidCookie = useCookie('currentProject-uid', {
          default: () => '',
          maxAge: 60 * 60 * 24 * 30,
          secure: true,
          sameSite: 'lax'
        });
        const nameCookie = useCookie('currentProject-name', {
          default: () => '',
          maxAge: 60 * 60 * 24 * 30,
          secure: true,
          sameSite: 'lax'
        });
        const descriptionCookie = useCookie('currentProject-description', {
          default: () => '',
          maxAge: 60 * 60 * 24 * 30,
          secure: true,
          sameSite: 'lax'
        });

        this.uid = uidCookie.value || '';
        this.name = nameCookie.value || '';
        this.description = descriptionCookie.value || '';
        this.isHydrated = true;
      }
    },

    async initialize(projectId: string, projectName: string) {
      this.reset();
      this.uid = projectId;
      this.name = projectName;

      // Cookies auch setzen für SSR
      if (import.meta.server || import.meta.client) {
        const uidCookie = useCookie('currentProject-uid');
        const nameCookie = useCookie('currentProject-name');
        
        uidCookie.value = projectId;
        nameCookie.value = projectName;
      }

      await Promise.all([this.fetchProjectDetails(), this.fetchTargets()]);

      if (import.meta.client) {
        this.fetchDomains();
      }

      this.isHydrated = true;
    },

    async fetchProjectDetails() {
      const projectsStore = useProjectsStore();
      const project = await projectsStore.fetchSingleProject(this.uid);
      if (project) {
        this.name = project.name;
        this.description = project.description;
        
        // Cookie auch aktualisieren
        if (import.meta.server || import.meta.client) {
          const nameCookie = useCookie('currentProject-name');
          const descriptionCookie = useCookie('currentProject-description');
          
          nameCookie.value = project.name;
          descriptionCookie.value = project.description;
        }
      }
    },

    async fetchDomains() {
      const { fetcher } = this._initBaseStore();

      const fetchDomainsWithCache = fetcher(
        () => {
          const api = useDomainsApi();
          return api.getDomainsByProjectUID(this.uid);
        },
        "domains",
        (data: ADDomain[]) => {
          this.domains = data;
        },
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
        "targets",
        (data: ADTarget[]) => {
          this.targets = data;
        },
      );

      await fetchTargetsWithCache();
    },

    async fetchLogs() {
      const { fetcher } = this._initBaseStore();
      const fetchTargetsWithCache = fetcher(
        () => {
          const api = useProjectsApi();
          return api.getLogs(this.uid);
        },
        "logs",
        (logs: ADPwnLogEntry[]) => {
          return logs;
        },
      );

      const res = await fetchTargetsWithCache();

      return res?.data ?? [];
    },

    async createDomain(domainData: ADDomain) {
      const { entityCreator } = this._initBaseStore();

      const createDomainEntity = entityCreator(
        () => {
          const api = useDomainsApi();
          console.log("Creating domain with data:", JSON.stringify(domainData));
          return api.createDomain(this.uid, domainData);
        },
        "domains",
        this.domains,
        { successToast: true },
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
        "targets",
        this.targets,
        { successToast: true },
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

          // Cookies aktualisieren
          if (import.meta.server || import.meta.client) {
            const nameCookie = useCookie('currentProject-name');
            const descriptionCookie = useCookie('currentProject-description');
            
            if (payload.name) nameCookie.value = payload.name;
            if (payload.description) descriptionCookie.value = payload.description;
          }

          const projectsStore = useProjectsStore();
          projectsStore.updateProject({
            uid: this.uid,
            ...payload,
          });

          invalidateCache(this.cache);

          const toast = useToast();
          toast.add({
            title: "Success",
            description: "Project updated successfully.",
            color: "success",
          });
        },
      );
    },

    clearProject() {
      this.reset();
      
      // Cookies auch löschen
      if (import.meta.server || import.meta.client) {
        const uidCookie = useCookie('currentProject-uid');
        const nameCookie = useCookie('currentProject-name');
        const descriptionCookie = useCookie('currentProject-description');
        
        uidCookie.value = null;
        nameCookie.value = null;
        descriptionCookie.value = null;
      }
    },

    reset() {
      const { invalidateCache } = this._initBaseStore();
      this.$reset();
      this.isHydrated = false;
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