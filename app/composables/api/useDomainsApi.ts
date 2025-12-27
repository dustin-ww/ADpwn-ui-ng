// composables/api/useProjectsApi.ts
import { useApiClient } from "~/composables/utils/useApiWrapper";
import { API_ROUTES } from "#imports";
import type { ADDomain } from "~/types/ad/ADDomain";
import type { ADHost } from "~/types/ad/ADHost";
import type { ADUser } from "~/types/ad/ADUsers";

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

    addHost: (projectUid: string, domainUid: string, hostData: ADHost) =>
      api.create<ADHost>(
        API_ROUTES.PROJECTS.DOMAINS.HOSTS(projectUid, domainUid),
        hostData
      ),

    addUser: (projectUid: string, domainUid: string, userData: ADUser) =>
      api.create<ADUser>(
        API_ROUTES.PROJECTS.DOMAINS.USERS(projectUid, domainUid),
        userData
      ),
  };
};
