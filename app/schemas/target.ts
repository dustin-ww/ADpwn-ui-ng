import { z } from "zod";

export const targetSchema = z.object({
  note: z.string(),
  ip: z.string().ip({ version: "v4", message: "Must be a valid IP address" }),
  cidr: z.number().max(32, "Must be a valid CIDR notation (<= /32)"),
});

export type TargetSchema = z.infer<typeof targetSchema>;