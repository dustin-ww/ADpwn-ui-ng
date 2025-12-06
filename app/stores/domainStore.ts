import { defineStore } from "pinia";
import { useBaseStore, type BaseStoreState } from "~/composables/utils/useBaseStore";
import { useDomainsApi } from "~/composables/api/useDomainsApi";
import type { ADDomain } from "~/types/ad/ADDomain";

interface DomainStoreState extends BaseStoreState {
  domains: ADDomain[];
}

export const useDomainStore = defineStore("domainStore", {
  state: (): DomainStoreState => ({
    domains: [],
    loading: false,
    error: null,
    cache: {
      domains: null,
    },
  }),
  
  getters: {
    hasDomains: (state) => state.domains.length > 0,
    getDomains: (state) => state.domains,
    getDomainByUID: (state) => (uid: string) => 
      state.domains.find(d => d.uid === uid),
  },
  
  actions: {
    _initBaseStore() {
      const baseStore = useBaseStore<DomainStoreState>("domainStore");
      const fetcher = baseStore.createFetcher(this);
      const entityCreator = baseStore.createEntityCreator(this);
      return { ...baseStore, fetcher, entityCreator };
    },

    async fetchDomains(projectUID: string, options?: { skipCache?: boolean }) {
      const { fetcher } = this._initBaseStore();
      const fetchDomainsWithCache = fetcher(
        () => {
          const api = useDomainsApi();
          return api.getDomainsByProjectUID(projectUID);
        },
        "domains",
        (data: ADDomain[]) => {
          this.domains = data;
        },
        { skipCache: options?.skipCache || false }
      );
      return await fetchDomainsWithCache();
    },

    async createDomain(projectUID: string, domainData: ADDomain) {
      const { entityCreator } = this._initBaseStore();
      const createDomainEntity = entityCreator(
        () => {
          const api = useDomainsApi();
          return api.createDomain(projectUID, domainData);
        },
        "domains",
        this.domains,
        { successToast: true },
      );
      await createDomainEntity();
    },

    clearDomains() {
      const { invalidateCache } = this._initBaseStore();
      this.$reset();
      invalidateCache(this.cache);
    },
  },
});
