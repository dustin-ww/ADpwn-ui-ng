// composables/api/useProjectsApi.ts
import { useApiClient } from "~/composables/utils/useApiWrapper";
import { API_ROUTES } from "#imports";
import type { ADDomain } from "~/types/ad/ADDomain";
import type { ADHost } from "~/types/ad/ADHost";

export const useHostsApi = () => {
  const api = useApiClient();

  return {

    createHost: (projectUid: string, hostData: ADHost) =>
      api.create<ADHost>(
        API_ROUTES.PROJECTS.HOSTS.ROOT(projectUid),
        hostData
      ),
  };
};
