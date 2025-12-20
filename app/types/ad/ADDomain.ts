import * as v from "valibot";

export const adDomainSchema = v.object({
  // General
  uid: v.string(),
  name: v.pipe(v.string(), v.minLength(3, "Must be at least 3 characters")),
  dnsName: v.optional(v.string()),
  netBiosName: v.optional(v.string()),
  domainGuid: v.optional(v.string()),
  domainSid: v.optional(v.string()),

  // Infrastructure
  description: v.string(),
  status: v.string(),
  type: v.string(),
  region: v.string(),
  vpcId: v.string(),
  subnetIds: v.array(v.string()),
  securityGroupIds: v.array(v.string()),

  // Network
  dnsIpAddresses: v.array(v.string()),
  ldapIpAddresses: v.array(v.string()),
  domainControllerIpAddresses: v.optional(v.array(v.string())),

  // AD Policies
  securityPolicies: v.optional(
    v.object({
      minPwdLength: v.optional(v.number()),
      pwdHistoryLength: v.optional(v.number()),
      lockoutThreshold: v.optional(v.number()),
      lockoutDuration: v.optional(v.number()),
    }),
  ),

  // Trust Relationships
  trustRelationships: v.optional(
    v.array(
      v.object({
        trustedDomain: v.string(),
        direction: v.union([
          v.literal("inbound"),
          v.literal("outbound"),
          v.literal("bidirectional"),
        ]),
        trustType: v.union([
          v.literal("parent-child"),
          v.literal("cross-forest"),
          v.literal("external"),
        ]),
        isTransitive: v.boolean(),
      }),
    ),
  ),

  // Metadata
  tags: v.record(v.string(), v.string()),
  createdAt: v.string(),
  updatedAt: v.string(),
  createdBy: v.string(),
  updatedBy: v.string(),

  lastModifiedAt: v.optional(v.string()),
  

  // Statusflags
  isDefault: v.boolean(),
  isActiveDirectoryManagedDomain: v.boolean(),
  isDomainController: v.optional(v.boolean()),

  // Functional Levels
  domainFunctionLevel: v.optional(v.string()),
  forestFunctionLevel: v.optional(v.string()),

  // Legacy AD Attributes
  linkedGpos: v.optional(v.array(v.string())),
  fsmoRoleOwners: v.optional(v.array(v.string())),
});

export type ADDomain = v.InferOutput<typeof adDomainSchema>;
