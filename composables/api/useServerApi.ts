// composables/api/useProjectsApi.ts
import { useApiClient } from "~/composables/api/useApiWrapper";
import { API_ROUTES } from "~/utils/api-routes";

export const useServerApi = () => {
  const api = useApiClient();

  return {
    // Load All Projects
    getHealth: () => api.get(API_ROUTES.SERVER.HEALTH),
    // Custom Request
    // searchProjects: (query: string) =>
    //   api.customRequest<ProjectSearchResult[]>(
    //     `${API_ROUTES.PROJECTS.BASE}/search`,
    //     'POST',
    //     { data: { query } }
    //   )
  };
};
