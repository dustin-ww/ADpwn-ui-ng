import { useDomainsApi } from "~/composables/api/useDomainsApi";
import { useHostsApi } from "~/composables/api/useHostsApi";
import { useBaseStore } from "~/composables/utils/useBaseStore";
import type { ADHost } from "~/types/ad/ADHost";

export const useHostStore = defineStore("hostStore", {
  state: (): HostStoreState => ({
    hosts: [],
    loading: false,
    error: null,
    cache: {
      hosts: null,
    },
  }),
  
  getters: {
    hasHosts: (state) => state.hosts.length > 0,
    getHosts: (state) => state.hosts,
    getHostsByDomain: (state) => (domainUID: string) =>
      state.hosts.filter(h => h.belongsToDomainUID === domainUID),
  },
  
  actions: {
    _initBaseStore() {
      const baseStore = useBaseStore<HostStoreState>("hostStore");
      const fetcher = baseStore.createFetcher(this);
      const entityCreator = baseStore.createEntityCreator(this);
      return { ...baseStore, fetcher, entityCreator };
    },

    async fetchHosts(projectUID: string, options?: { skipCache?: boolean }) {
      const { fetcher } = this._initBaseStore();
      const fetchHostsWithCache = fetcher(
        () => {
          const api = useHostsApi();
          return api.getHostsByProjectUID(projectUID);
        },
        "hosts",
        (data: ADHost[]) => {
          this.hosts = data;
        },
        { skipCache: options?.skipCache || false }
      );
      return await fetchHostsWithCache();
    },

    async createHost(projectUID: string, domainUID: string | undefined, hostData: ADHost) {
      const { entityCreator } = this._initBaseStore();
      const createHostEntity = entityCreator(
        () => {
          const domainApi = useDomainsApi();
          const hostApi = useHostsApi();
          
          if (hostData.belongsToDomainUID && domainUID) {
            return domainApi.addHost(projectUID, domainUID, hostData);
          } else {
            return hostApi.createHost(projectUID, hostData);
          }
        },
        "hosts",
        this.hosts,
        { successToast: true },
      );
      await createHostEntity();
    },

    clearHosts() {
      const { invalidateCache } = this._initBaseStore();
      this.$reset();
      invalidateCache(this.cache);
    },
  },
});