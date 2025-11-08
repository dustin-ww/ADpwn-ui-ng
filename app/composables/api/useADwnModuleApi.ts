import type { ADPwnModule } from "~/app/types/adpwn/ADPwnModule";
import type { ADPwnInheritanceGraph } from "~/app/types/adpwn/ADPwnModuleGraph";
import { useApiClient } from "../utils/useApiWrapper";
import type { ADPwnModuleOption } from "~/app/types/adpwn/ADPwnModuleOption";
import type { ADPwnModuleParameters } from "~/app/types/adpwn/ADPwnModuleParameters";
import { API_ROUTES } from "#imports";

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
