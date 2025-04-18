import type { ADPwnModuleOption } from "./ADPwnModuleOption";

export interface ADPwnModule {
  uid?: string;
  attack_id: string;
  execution_metric: string;
  description: string;
  name: string;
  version: string;
  author: string;
  module_type: string;
  loot_path: string;
  key: string;
  options: ADPwnModuleOption[];
  // already sorted from the api
  dependency_vector_keys: string[];
  dependency_vector: ADPwnModule[];
}
