export interface ProjectADTargets {
  targets: ADTarget[];
}

export interface ADTarget {
  uid: string;
  name: string;
  ip_range: string;
}
