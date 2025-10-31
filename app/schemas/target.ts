import { z } from "zod";

export const targetSchema = z.object({
  note: z.string(),
  ip: z
    .string()
    .refine(
      (val) =>
        /^(25[0-5]|2[0-4]\d|1?\d{1,2})(\.(25[0-5]|2[0-4]\d|1?\d{1,2})){3}$/.test(val),
      { message: "Must be a valid IPv4 address" }
    ),
  cidr: z
    .number()
    .int()
    .min(0, "CIDR must be between 0 and 32")
    .max(32, "CIDR must be between 0 and 32"),
});

export type TargetSchema = z.infer<typeof targetSchema>;
