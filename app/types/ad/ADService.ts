export interface ADService {
  uid: string;
  deployedOnHost?: string;

    // AD related
  spns?: string[];
  accountName?: string;
  sid?: string;
  passwordLastSet?: number;
  constrainedDelegation?: string[];
  unconstrainedDelegation?: boolean;
  dnsHostName?: string;
  whenCreated?: string;
  whenChanged?: string;
  lastLogon?: number;
  operatingSystem?: string;
  description?: string;
  isLegacy?: boolean;
  trustedForDelegation?: boolean;
  accountCanBeDelegated?: boolean;
}
