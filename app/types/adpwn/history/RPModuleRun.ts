import type { ADTarget } from "~/types/ad/ADTarget";
import type { ADPwnModuleParameters } from "../ADPwnModuleParameters";

export interface RPModuleRun {
  moduleKey: string;
  runUid: string;
  vectorRunUid: string;
  ranAt: string;
  projectUid: string;
  wasSuccessful: boolean;
  targets: ADTarget[];
  parameters: ADPwnModuleParameters[];
}