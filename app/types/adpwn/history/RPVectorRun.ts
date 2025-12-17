import type { ADPwnInheritanceGraph } from "../ADPwnModuleGraph";

export interface RPVectorRun {
  runUid: string;
  ranAt: string; 
  projectUid: string;
  graph: ADPwnInheritanceGraph;
}