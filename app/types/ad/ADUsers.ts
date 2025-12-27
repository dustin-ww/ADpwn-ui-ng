export interface ADUser {
  uid: string;
  name: string;
  description: string;

  // Identity
  samAccountName: string;
  upn: string;
  sid: string;
  accountType: string;

  // Credentials
  password: string;
  ntlmHash: string;
  credentialType: string;

  // Privileges
  isAdmin: boolean;
  isDomainAdmin: boolean;
  memberOf: string[];

  // Kerberos
  spns: string[];
  kerberoastable: boolean;
  asrepRoastable: boolean;

  // Delegation
  trustedForDelegation: boolean;
  unconstrainedDelegation: boolean;

  // Usage
  lastLogon: Date;
  workstations: string[];

  // Risk
  riskScore: number;
  riskReasons: string[];

  // History related
  discoveredAt?: Date;
  discoveredBy?: string;
  lastSeenAt?: Date;
  lastSeenBy?: string;

  belongsToDomain?: string[];
}
