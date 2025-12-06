import type { ADDomain } from "../ad/ADDomain";
import type { ADTarget } from "../ad/ADTarget";

export interface ADPwnProject {
  uid: string;
  name: string;
  createdAt?: string;
  modifiedAt?: string;
  description?: string;
  type?: string;
  hasTarget?: ADTarget[];
  hasDomain?: ADDomain[];
}
