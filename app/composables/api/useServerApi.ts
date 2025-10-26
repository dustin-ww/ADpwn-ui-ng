// composables/api/useProjectsApi.ts
import { useApiClient } from "./useApiWrapper"; 
import { API_ROUTES } from "#imports";

export const useServerApi = () => {
  const api = useApiClient();

  return {
    getHealth: () => api.get(API_ROUTES.SERVER.HEALTH),
  };
};
