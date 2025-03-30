export interface ADDomain {
  uid: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  status: string;
  type: string;
  region: string;
  vpcId: string;
  dnsIpAddresses: string[];
  ldapIpAddresses: string[];
  subnetIds: string[];
  securityGroupIds: string[];
  tags: Record<string, string>;
  createdBy: string;
  updatedBy: string;
  isDefault: boolean;
  isActiveDirectoryManagedDomain: boolean;
  domainControllerIpAddresses?: string[];
}
