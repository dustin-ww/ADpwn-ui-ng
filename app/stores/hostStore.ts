import { defineStore } from "pinia";
import { useBaseStore, type BaseStoreState } from "~/composables/utils/useBaseStore";
import { useDomainsApi } from "~/composables/api/useDomainsApi";
import { useHostsApi } from "~/composables/api/useHostsApi";
import type { ADHost } from "~/types/ad/ADHost";

interface HostStoreState extends BaseStoreState {
  hosts: ADHost[];
}

export const useHostStore = defineStore("HostStore", {
  state: (): HostStoreState => ({
    hosts: [],
    loading: false,
    error: null,
    cache: {
      domains: null,
    },
  }),

  getters: {
    hasHosts: (state) => state.hosts.length > 0,
    getHosts: (state) => state.hosts,
  },

  actions: {
    _initBaseStore() {
      const baseStore = useBaseStore<HostStoreState>("hostStore");
      const fetcher = baseStore.createFetcher(this);
      const entityCreator = baseStore.createEntityCreator(this);
      return { ...baseStore, fetcher, entityCreator };
    },

    async createHost(projectUID: string, domainUID: string | undefined, hostData: ADHost) {
      const { entityCreator } = this._initBaseStore();

      const createHostEntity = entityCreator(
        () => {
          const domainApi = useDomainsApi();
          const hostApi = useHostsApi();

          // Prüfe, ob eine Domain wirklich gesetzt ist
          if (hostData.belongsToDomainUID && domainUID) {
            console.log("Creating host WITH domain:", JSON.stringify(hostData));
            return domainApi.addHost(projectUID, domainUID, hostData);
          } else {
            console.log("Creating host WITHOUT domain:", JSON.stringify(hostData));
            return hostApi.createHost(projectUID, hostData);
          }
        },
        "hosts",
        this.hosts,
        { successToast: true },
      );

      await createHostEntity();
    },

    clearDomains() {
      const { invalidateCache } = this._initBaseStore();
      this.$reset();
      invalidateCache(this.cache);
    },
  },
});
