import type { ADPwnModule } from "~/types/adpwn/ADPwnModule";
import type { ADPwnInheritanceGraph } from "~/types/adpwn/ADPwnModuleGraph";
import { useApiClient } from "./useApiWrapper";

export const useADPwnModuleApi = () => {
  const api = useApiClient();

  return {
    getModules: () => api.get<ADPwnModule[]>(API_ROUTES.ADPWN_MODULES.MODULES.BASE),
    getGraph: () =>
      api.get<ADPwnInheritanceGraph>(API_ROUTES.ADPWN_MODULES.MODULES.GRAPH),
  };
};
