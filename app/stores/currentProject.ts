import { defineStore } from "pinia";
import type { ADTarget } from "~/app/types/ad/ADTarget";
import type { ProjectUpdateSchema } from "~/app/schemas/project";
import type { TargetSchema } from "~/app/schemas/target";
import { useBaseStore, type BaseStoreState } from "~/composables/useBaseStore";
import { useDomainsApi } from "~/composables/api/useDomainsApi";
import { useProjectsApi } from "~/composables/api/useProjectsApi";
import type { ADDomain } from "~/app/types/ad/ADDomain";
import type { ADPwnLogEntry } from "~/app/types/adpwn/ADPwnLogEntry";

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
    hasProject: (state) => state.uid !== "",
  },

  actions: {
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

    // State aus Cookies laden (Server + Client)
    hydrate() {
      const uid = useCookie('currentProject-uid', { default: () => '' });
      const name = useCookie('currentProject-name', { default: () => '' });
      const description = useCookie('currentProject-description', { default: () => '' });

      this.uid = uid.value;
      this.name = name.value;
      this.description = description.value;
    },

    // State in Cookies speichern
    _syncCookies() {
      const uid = useCookie('currentProject-uid');
      const name = useCookie('currentProject-name');
      const description = useCookie('currentProject-description');

      uid.value = this.uid;
      name.value = this.name;
      description.value = this.description;
    },

    async initialize(projectId: string, projectName: string) {
      this.reset();
      this.uid = projectId;
      this.name = projectName;
      this._syncCookies();

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
        this._syncCookies();
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


    async fetchDomainsAndHosts(options?: { skipCache?: boolean }) {
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
        { skipCache: options?.skipCache || false }
      );

      const result = await fetchDomainsWithCache();
      console.log("Domains fetched:", result);

      // Greife auf result.data zu
      const domains = result.data ?? [];

      const api = useDomainsApi();

      const hostResults = await Promise.all(
        domains
          .filter(d => d.uid) // Beachte: deine Objekte haben "uid", nicht "uuid"
          .map(d => api.getHostsByDomainUID(this.uid, d.uid))
      );

      return hostResults.flat();
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
          if (payload.name) this.name = payload.name;
          if (payload.description) this.description = payload.description;
          this._syncCookies();

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
      this._syncCookies();
    },

    reset() {
      const { invalidateCache } = this._initBaseStore();
      this.$reset();
      invalidateCache(this.cache);
    },
  },
});