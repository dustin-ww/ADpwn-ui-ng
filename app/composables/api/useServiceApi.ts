import type { ADService } from "~/types/ad/ADService";
import { useApiClient } from "../utils/useApiWrapper";

export const useServiceApi = () => {
  const api = useApiClient();

  return {
    getServicesByHostUID: (projectUid: string, hostUid: string) =>
          api.get<ADService[]>(API_ROUTES.PROJECTS.HOSTS.SERVICES(projectUid, hostUid)),
  };
};
