export interface ProjectADTargets {
  targets: ADTarget[];
}

export interface ADTarget {
  uid: string;
  note: string;
  ip: string;
  cidr: number;
}
