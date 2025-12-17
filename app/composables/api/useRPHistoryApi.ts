import type { RPModuleRun } from "~/types/adpwn/history/RPModuleRun";
import { useApiClient } from "../utils/useApiWrapper";
import type { RPVectorRun } from "~/types/adpwn/history/RPVectorRun";

export const usePRHistoryApi = () => {
  const api = useApiClient();

  return {
    // Get all ADPwn modules
    getModuleRuns: (projectUID: string) =>
      api.get<RPModuleRun[]>(API_ROUTES.ADPWN.HISTORY.MODULE_RUNS(projectUID)),

    getVectorRuns: (projectUID: string) =>
      api.get<RPVectorRun[]>(API_ROUTES.ADPWN.HISTORY.VECTORS_RUNS(projectUID)),
  };
};
