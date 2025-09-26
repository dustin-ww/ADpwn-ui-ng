import type { ModuleOptionType } from "./ADPwnModuleOption";

export interface ADPwnModuleResponse {
  module: string;  
  key: string;
  type: ModuleOptionType;
  value: string;
}
