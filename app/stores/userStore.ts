import { useDomainsApi } from "~/composables/api/useDomainsApi";
import { useHostsApi } from "~/composables/api/useHostsApi";
import { useUsersApi } from "~/composables/api/useUsersApi";
import { useBaseStore } from "~/composables/utils/useBaseStore";
import type { ADHost } from "~/types/ad/ADHost";
import type { ADUser } from "~/types/ad/ADUsers";

export const useUserStore = defineStore("userStore", {
  state: (): UserStoreState => ({
    users: [],
    loading: false,
    error: null,
    cache: {
      hosts: null,
    },
  }),
  
  getters: {
    hasUsers: (state) => state.users.length > 0,
    getUsers: (state) => state.users,
    getUsersByDomain: (state) => (domainUID: string) => {
      return null; // Implement user filtering by domain if needed
    },
  },
  
  actions: {
    _initBaseStore() {
      const baseStore = useBaseStore<UserStoreState>("userStore");
      const fetcher = baseStore.createFetcher(this);
      const entityCreator = baseStore.createEntityCreator(this);
      return { ...baseStore, fetcher, entityCreator };
    },

    async fetchUsers(projectUID: string, options?: { skipCache?: boolean }) {
      const { fetcher } = this._initBaseStore();
      const fetchUsersWithCache = fetcher(
        () => {
          const api = useUsersApi();
          return api.getUsersByProjectUID(projectUID);
        },
        "users",
        (data: ADUser[]) => {
          this.users = data;
        },
        { skipCache: options?.skipCache || false }
      );
      return await fetchUsersWithCache();
    },

    async createUser(projectUID: string, domainUID: string | undefined, userData: ADUser) {
      const { entityCreator } = this._initBaseStore();
      const createUserEntity = entityCreator(
        () => {
          const domainApi = useDomainsApi();
          const userApi = useUsersApi();

          if (userData.belongsToDomain && domainUID) {
            return domainApi.addUser(projectUID, domainUID, userData);
          } else {
            return userApi.createUser(projectUID, userData);
          }
        },
        "users",
        this.users,
        { successToast: true },
      );
      await createUserEntity();
    },

    clearUsers() {
      const { invalidateCache } = this._initBaseStore();
      this.$reset();
      invalidateCache(this.cache);
    },
  },
});