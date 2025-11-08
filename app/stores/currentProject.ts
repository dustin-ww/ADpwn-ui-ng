import { defineStore } from "pinia";
import { useBaseStore, type BaseStoreState } from "~/composables/utils/useBaseStore";
import { useProjectsApi } from "~/composables/api/useProjectsApi";
import { useCookieSync } from "~/composables/useCookieSync";
import type { ADTarget } from "~/types/ad/ADTarget";
import type { TargetSchema } from "~/schemas/target";
import type { ProjectUpdateSchema } from "~/schemas/project";

interface CurrentProjectState extends BaseStoreState {
  uid: string;
  name: string;
  description: string;
  targets: ADTarget[];
}

export const useCurrentProjectStore = defineStore("currentProject", {
  state: (): CurrentProjectState => ({
    uid: "",
    name: "",
    description: "",
    targets: [],
    loading: false,
    error: null,
    cache: {
      targets: null,
    },
  }),

  getters: {
    hasTargets: (state) => state.targets.length > 0,
    getTargets: (state) => state.targets,
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

    // Load current project state from Cookies
    hydrate() {
      const cookieSync = useCookieSync('currentProject');
      cookieSync.hydrate(this, ['uid', 'name', 'description']);
    },

    // Store current project state to Cookies
    _syncCookies() {
      const cookieSync = useCookieSync('currentProject');
      cookieSync.sync(this, ['uid', 'name', 'description']);
    },

    async initialize(projectId: string, projectName: string) {
      this.reset();
      this.uid = projectId;
      this.name = projectName;
      this._syncCookies();

      await Promise.all([this.fetchProjectDetails(), this.fetchTargets()]);
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
