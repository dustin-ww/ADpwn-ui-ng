import type { ADPwnModule } from "~/types/adpwn/ADPwnModule";
import type { ADPwnInheritanceGraph } from "~/types/adpwn/ADPwnModuleGraph";
import { useApiClient } from "./useApiWrapper";
import type { ADPwnModuleOption } from "~/types/adpwn/ADPwnModuleOption";
import type { ADPwnModuleParameters } from "~/types/adpwn/ADPwnModuleParameters";

export const useADPwnModuleApi = () => {
  const api = useApiClient();

  return {
    getModules: () =>
      api.get<ADPwnModule[]>(API_ROUTES.ADPWN_MODULES.MODULES.BASE),
    getGraph: () =>
      api.get<ADPwnInheritanceGraph>(API_ROUTES.ADPWN_MODULES.MODULES.GRAPH),
    runAttackVector: (moduleKey: string, parameterData: ADPwnModuleParameters[]) =>
      api.create<ADPwnModule>(
        API_ROUTES.ADPWN_MODULES.MODULES.ITEMS.VECTOR.RUN(moduleKey),
        parameterData),
    getAttackVectorOptions: (moduleKey: string) =>
      api.get<ADPwnModuleOption[]>(
        API_ROUTES.ADPWN_MODULES.MODULES.ITEMS.VECTOR.OPTIONS(moduleKey),
      ),
    
  };
};
