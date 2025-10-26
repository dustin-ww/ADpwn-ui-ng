import type { ADPwnModuleInheritanceEdge } from "./ADPwnInheritanceEdge";
import type { ADPwnModule } from "./ADPwnModule";

export interface ADPwnInheritanceGraph {
  nodes: ADPwnModule[];
  edges: ADPwnModuleInheritanceEdge[];
}
