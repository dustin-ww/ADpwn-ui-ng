import * as v from "valibot";

export interface ADHost {
  // internal
  uid?: string;
  createdAt?: Date;

  // ad related
  distinguishedName: string;
  objectGUID: string;
  objectSid: string;
  sAMAccountName: string;
  dNSHostName: string;
  operatingSystem: string;
  operatingSystemVersion: string;
  lastLogonTimestamp: Date;
  whenCreated: Date;
  whenChanged: Date;
  userAccountControl: number;
}

export const adHostInputSchema = v.object({
  distinguishedName: v.string(),
  objectGUID: v.string(),
  objectSid: v.string(),
  sAMAccountName: v.string(),
  dNSHostName: v.string(),
  operatingSystem: v.string(),
  operatingSystemVersion: v.string(),
  lastLogonTimestamp: v.date(),
  whenCreated: v.date(),
  whenChanged: v.date(),
  userAccountControl: v.number(),
});
