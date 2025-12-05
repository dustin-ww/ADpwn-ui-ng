import { defineStore } from 'pinia'
import { useBaseStore, type BaseStoreState } from "~/composables/utils/useBaseStore";
import type { ADService } from '~/types/ad/ADService';
import { useServiceApi } from '~/composables/api/useServiceApi';

interface ServiceStoreState extends BaseStoreState {
  services: ADService[];
}

export const useServiceStore = defineStore("serviceStore", {
  state: (): ServiceStoreState => ({
    services: [],
    loading: false,
    error: null,
    cache: {
      services: null,
    },
  }),
  
  getters: {
    hasServices: (state) => state.services.length > 0,
    getServices: (state) => state.services,
    getServiceByUID: (state) => (uid: string) => 
      state.services.find(d => d.uid === uid),
    getServicesByHost: (state) => (hostUID: string) =>
    state.services.filter(s => {
      if (!s.runsOnHosts) return false;
      
      if (typeof s.runsOnHosts === 'object' && 'uid' in s.runsOnHosts) {
        return s.runsOnHosts.uid === hostUID;
      }
      
      return s.runsOnHosts === hostUID;
    }),
  },
  
  actions: {
    _initBaseStore() {
      const baseStore = useBaseStore<ServiceStoreState>("serviceStore");
      const fetcher = baseStore.createFetcher(this);
      const entityCreator = baseStore.createEntityCreator(this);
      return { ...baseStore, fetcher, entityCreator };
    },

    async fetchServices(projectUID: string, hostUID: string, options?: { skipCache?: boolean }) {
      const { fetcher } = this._initBaseStore();
  
      const fetchServicesWithCache = fetcher(
        () => {
          const api = useServiceApi();
          return api.getServicesByHostUID(projectUID, hostUID);
        },
        "services",
        (data: ADService[]) => {
          this.services = this.services.filter(s => {
            if (!s.runsOnHosts) return true;
            if (typeof s.runsOnHosts === 'object' && 'uid' in s.runsOnHosts) {
              return s.runsOnHosts.uid !== hostUID;
            }
            return s.runsOnHosts !== hostUID;
          });
          
          // Füge die nuen Services hinzu
          this.services.push(...data);
        },
        { skipCache: options?.skipCache || false }
      );
  
    return await fetchServicesWithCache();
    },

    clearServices() {
      const { invalidateCache } = this._initBaseStore();
      this.$reset();
      invalidateCache(this.cache);
    },
  },
});
