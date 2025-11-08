// composables/api/useProjectsApi.ts
import { useApiClient } from "~/composables/utils/useApiWrapper";
import { API_ROUTES } from "#imports";
import type { ADDomain } from "~/types/ad/ADDomain";

export const useDomainsApi = () => {
  const api = useApiClient();

  return {
    // Load all domains for a project
    getDomainsByProjectUID: (projectUid: string) =>
      api.get<ADDomain[]>(API_ROUTES.PROJECTS.DOMAINS.LIST(projectUid)),

    // Create a new domain in a project
    createDomain: (projectUid: string, domainData: ADDomain) =>
      api.create<ADDomain>(
        API_ROUTES.PROJECTS.DOMAINS.LIST(projectUid),
        domainData,
      ),

    // Load all hosts for a specific domain
    getHostsByDomainUID: (projectUid: string, domainUid: string) =>
      api.get<ADDomain[]>(
        API_ROUTES.PROJECTS.DOMAINS.HOSTS(projectUid, domainUid)
      ),

    // Optional: Get Project Detail if needed later
    // getProjectDetail: (uid: string) =>
    //   api.get<ADPwnProject>(API_ROUTES.PROJECTS.DETAIL(uid)),

    // Optional: Update Project if needed later
    // updateProject: (uid: string, updateData: ProjectUpdateSchema) =>
    //   api.update<ADPwnProject>(
    //     API_ROUTES.PROJECTS.DETAIL(uid),
    //     updateData,
    //     { headers: { "Content-Type": "application/merge-patch+json" } }
    //   ),

    // Optional: Search Projects if implemented later
    // searchProjects: (query: string) =>
    //   api.customRequest<ProjectSearchResult[]>(
    //     `${API_ROUTES.PROJECTS.ROOT}/search`,
    //     'POST',
    //     { data: { query } }
    //   )
  };
};
