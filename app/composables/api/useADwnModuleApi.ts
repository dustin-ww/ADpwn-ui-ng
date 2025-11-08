import { useApiClient } from "../utils/useApiWrapper";
import { API_ROUTES } from "#imports";
import type { ADPwnModuleParameters } from "~/types/adpwn/ADPwnModuleParameters";
import type { ADPwnModuleOption } from "~/types/adpwn/ADPwnModuleOption";
import type { ADPwnInheritanceGraph } from "~/types/adpwn/ADPwnModuleGraph";
import type { ADPwnModule } from "~/types/adpwn/ADPwnModule";

export const useADPwnModuleApi = () => {
  const api = useApiClient();

  return {
    // Get all ADPwn modules
    getModules: () =>
      api.get<ADPwnModule[]>(API_ROUTES.ADPWN.MODULES.ROOT),

    // Get ADPwn module inheritance graph
    getGraph: () =>
      api.get<ADPwnInheritanceGraph>(API_ROUTES.ADPWN.MODULES.GRAPH),

    // Run attack vector for a specific module
    runAttackVector: (moduleKey: string, parameterData: ADPwnModuleParameters[]) =>
      api.create<ADPwnModule>(
        API_ROUTES.ADPWN.MODULES.VECTOR.RUN(moduleKey),
        parameterData
      ),

    // Get attack vector options for a specific module
    getAttackVectorOptions: (moduleKey: string) =>
      api.get<ADPwnModuleOption[]>(
        API_ROUTES.ADPWN.MODULES.VECTOR.OPTIONS(moduleKey)
      ),
  };
};
