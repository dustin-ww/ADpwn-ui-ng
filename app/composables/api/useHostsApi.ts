// composables/api/useProjectsApi.ts
import { useApiClient } from "~/composables/utils/useApiWrapper";
import { API_ROUTES } from "#imports";
import type { ADDomain } from "~/types/ad/ADDomain";
import type { ADHost } from "~/types/ad/ADHost";
import type { ADService } from "~/types/ad/ADService";
import type { get } from "http";

export const useHostsApi = () => {
  const api = useApiClient();

  return {

    createHost: (projectUid: string, hostData: ADHost) =>
      api.create<ADHost>(
        API_ROUTES.PROJECTS.HOSTS.ROOT(projectUid),
        hostData
      ),

    getHostsByProjectUID: (projectUid: string) =>
      api.get<ADHost[]>(API_ROUTES.PROJECTS.HOSTS.ROOT(projectUid)),

    // Load all hosts for a specific domain
    getServicesByHostUID: (projectUid: string, hostUid: string) =>
      api.get<ADService[]>(
        API_ROUTES.PROJECTS.HOSTS.SERVICES(projectUid, hostUid)
    ),
  };
};
