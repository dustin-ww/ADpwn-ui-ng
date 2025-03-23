import type { ADPwnModule, ADPwnModuleInheritanceEdge } from "./ADPwnModule";

export interface ADPwnInheritanceGraph {
  nodes: ADPwnModule[];
  edges: ADPwnModuleInheritanceEdge[];
}
