export interface ADPwnModuleParameters {
  projectUid: string;
  metadata: Record<string, string>;
  inputs: Record<string, Input<any>>;
}

interface Input<T = unknown> {
  type: string;
  value: T;
}
