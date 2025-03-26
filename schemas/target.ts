import * as v from "valibot";

export const targetSchema = v.pipe(
  v.object({
    ip: v.optional(
      v.pipe(
        v.string(),
        v.ip("Must be a valid IP address")
      )
    ),
    cidr: v.optional(
      v.pipe(
        v.string(),
        v.regex(
          /^(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])){3}\/([0-9]|[1-2][0-9]|3[0-2])$/,
          "Must be a valid CIDR notation"
        )
      )
    ),
    note: v.pipe(
      v.string(),
      v.minLength(1, "Note must be at least 1 character long")
    ),
  }),
  v.check(
    ({ ip, cidr }) => Boolean(ip) !== Boolean(cidr),
    "Either 'ip' or 'cidr' must be provided, but not both"
  )
);

export type TargetSchema = v.InferOutput<typeof targetSchema>;
