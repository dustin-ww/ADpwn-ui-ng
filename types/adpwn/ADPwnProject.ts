import type { ADDomain } from "../ad/ADDomain";
import type { ADTarget } from "../ad/ADTarget";

export interface ADPwnProject {
  uid: string;
  name: string;
  created_at?: string;
  modified_at?: string;
  description?: string;
  type?: string;
  has_target?: ADTarget[];
  has_domain?: ADDomain[];
}
