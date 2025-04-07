// composables/api/useProjectsApi.ts
import { useApiClient } from "~/composables/api/useApiWrapper";
import type { ADDomain } from "~/types/ad/ADDomain";
import { API_ROUTES } from "~/utils/api-routes";

export const useDomainsApi = () => {
  const api = useApiClient();

  return {
    // Load All Projects
    getDomainsByProjectUID: (projectUid: string) =>
      api.get<ADDomain[]>(API_ROUTES.PROJECTS.DOMAINS.BASE(projectUid)),
    // Create Project
    createDomain: (projectUid: string, domainData: ADDomain) =>
      api.create<ADDomain>(
        API_ROUTES.PROJECTS.DOMAINS.BASE(projectUid),
        domainData,
      ),
    // Update Project
    // updateProject: (uid: string, updateData: ProjectUpdateSchema) =>
    //   api.update<ADPwnProject>(API_ROUTES.PROJECTS.DETAIL(uid), updateData, {
    //     headers: { "Content-Type": "application/merge-patch+json" },
    //   }),
    // Custom Request
    // searchProjects: (query: string) =>
    //   api.customRequest<ProjectSearchResult[]>(
    //     `${API_ROUTES.PROJECTS.BASE}/search`,
    //     'POST',
    //     { data: { query } }
    //   )
  };
};
