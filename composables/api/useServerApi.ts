// composables/api/useProjectsApi.ts
import { useApiClient } from "~/composables/api/useApiWrapper";
import { API_ROUTES } from "~/utils/api-routes";

export const useServerApi = () => {
  const api = useApiClient();

  return {
    getHealth: () => api.get(API_ROUTES.SERVER.HEALTH),
  };
};
