export interface ADPwnModuleParameters {
  project_uid: string;
  metadata: Record<string, string>;
  inputs: Record<string, Input<any>>;
}

interface Input<T = unknown> {
  type: string;
  value: T;
}
