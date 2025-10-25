// stores/logs.ts
import { defineStore } from "pinia";
import type { ADPwnLogEntry } from "~/types/adpwn/ADPwnLogEntry";
import { useBaseStore, type BaseStoreState } from "~/composables/useBaseStore";
import { useProjectsApi } from "~/composables/api/useProjectsApi";
import { useCurrentProjectStore } from "~/stores/currentProject";
import type { LogQueryOptionsSchema } from "~/schemas/logQuery";

interface LogsStoreState extends BaseStoreState {
  logs: ADPwnLogEntry[];
  logTypes: string[];
  logModuleKeys: string[];
}

export const useLogsStore = defineStore("logs", {
  state: (): LogsStoreState => ({
    logs: [],
    logTypes: [],
    logModuleKeys: [],
    loading: false,
    error: null,
    cache: {
      logs: null,
      logTypes: null,
      logModuleKeys: null,
    },
  }),

  getters: {
    hasLogs: (state) => state.logs.length > 0,
    getLogs: (state) => state.logs,
    getLogTypes: (state) => state.logTypes,
    getLogModuleKeys: (state) => state.logModuleKeys,
  },

  actions: {
    _initBaseStore() {
      const baseStore = useBaseStore<LogsStoreState>("logs");
      const fetcher = baseStore.createFetcher(this);
      return { ...baseStore, fetcher };
    },

    _getCurrentProjectUid(): string {
      const currentProject = useCurrentProjectStore();
      
      if (!currentProject.uid) {
        const uid = useCookie('currentProject-uid').value;
        if (!uid) {
          throw new Error('No current project selected');
        }
        return uid;
      }
      
      return currentProject.uid;
    },

    async fetchLogs(options?: { skipCache?: boolean }) {
      const projectUid = this._getCurrentProjectUid();
      const { fetcher } = this._initBaseStore();
      
      const fetchLogsWithCache = fetcher(
        () => {
          const api = useProjectsApi();
          return api.getLogs(projectUid);
        },
        "logs",
        (logs: ADPwnLogEntry[]) => {
          this.logs = logs;
          return logs;
        },
        { skipCache: options?.skipCache || false }
      );
      
      const res = await fetchLogsWithCache();
      return res?.data ?? [];
    },

    async fetchLogsWithQuery(query: LogQueryOptionsSchema) {
      const projectUid = this._getCurrentProjectUid();
      const { fetcher } = this._initBaseStore();
      
      const fetchLogsWithQuery = fetcher(
        () => {
          const api = useProjectsApi();
          return api.getLogsWithOptions(projectUid, query);
        },
        "logs",
        (logs: ADPwnLogEntry[]) => {
          this.logs = logs;
          return logs;
        },
        { skipCache: true }
      );
      
      const res = await fetchLogsWithQuery();
      return res?.data ?? [];
    },

    async fetchLogTypes(options?: { skipCache?: boolean }) {
      const projectUid = this._getCurrentProjectUid();
      const { fetcher } = this._initBaseStore();
      
      const fetchLogTypesWithCache = fetcher(
        () => {
          const api = useProjectsApi();
          return api.getLogTypes(projectUid);
        },
        "logTypes",
        (logTypes: string[]) => {
          this.logTypes = logTypes;
          return logTypes;
        },
        { skipCache: options?.skipCache || false }
      );

      const res = await fetchLogTypesWithCache();
      return res?.data ?? [];
    },

    async fetchLogModuleKeys(options?: { skipCache?: boolean }) {
      const projectUid = this._getCurrentProjectUid();
      const { fetcher } = this._initBaseStore();
      
      const fetchLogModuleKeysWithCache = fetcher(
        () => {
          const api = useProjectsApi();
          return api.getLogModuleKeys(projectUid);
        },
        "logModuleKeys",
        (logModuleKeys: string[]) => {
          this.logModuleKeys = logModuleKeys;
          return logModuleKeys;
        },
        { skipCache: options?.skipCache || false }
      );

      const res = await fetchLogModuleKeysWithCache();
      return res?.data ?? [];
    },

    clearLogs() {
      const { invalidateCache } = this._initBaseStore();
      this.$reset();
      invalidateCache(this.cache);
    },
  },
});