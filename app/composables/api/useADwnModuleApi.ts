import type { ADPwnModule } from "~/app/types/adpwn/ADPwnModule";
import type { ADPwnInheritanceGraph } from "~/app/types/adpwn/ADPwnModuleGraph";
import { useApiClient } from "./useApiWrapper";
import type { ADPwnModuleOption } from "~/app/types/adpwn/ADPwnModuleOption";
import type { ADPwnModuleParameters } from "~/app/types/adpwn/ADPwnModuleParameters";

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
