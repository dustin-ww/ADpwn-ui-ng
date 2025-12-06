import type { ADPwnModuleOption } from "./ADPwnModuleOption";

export interface ADPwnModule {
  uid?: string;
  attackId: string;
  executionMetric: string;
  description: string;
  name: string;
  version: string;
  author: string;
  moduleType: string;
  lootPath: string;
  key: string;
  options: ADPwnModuleOption[];
  // already sorted from the api
  dependencyVectorKeys: string[];
  dependencyVector: ADPwnModule[];
}
