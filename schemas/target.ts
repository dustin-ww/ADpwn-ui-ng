import * as v from "valibot";

// export const targetSchema = v.pipe(
//   v.object({
//     ip: v.required(v.pipe(v.string(), v.ip("Must be a valid IP address"))),
//     cidr: v.optional(
//       v.pipe(
//         v.string(),
//         v.regex(
//           /^(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])){3}\/([0-9]|[1-2][0-9]|3[0-2])$/,
//           "Must be a valid CIDR notation",
//         ),
//       ),
//     ),
//     name: v.pipe(
//       v.string(),
//       v.minLength(1, "Note must be at least 1 character long"),
//     ),
//   }),
//   v.check(
//     ({ ip, cidr }) => Boolean(ip) !== Boolean(cidr),
//     "Either 'ip' or 'cidr' must be provided, but not both",
//   ),
// );

export const targetSchema = v.object({
  name: v.pipe(v.string(), v.minLength(3, "Must be at least 3 characters")),
  ip: v.pipe(v.string(), v.ipv4("Must be a valid IP address")),
  cidr: v.pipe(
    v.number(),
    v.maxValue(32, "Must be a valid CIDR notation (<= /32)"),
  ),
});

export type TargetSchema = v.InferOutput<typeof targetSchema>;
