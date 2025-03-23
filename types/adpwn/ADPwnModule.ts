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
}

export interface ADPwnModuleInheritanceEdge {
  previous_module: string;
  next_module: string;
}
