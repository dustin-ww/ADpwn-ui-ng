import * as v from "valibot";


export const adDomainSchema = v.object({
  name: v.pipe(v.string(), v.minLength(3, "Must be at least 3 characters")),
});

export type ADDomainSchema = v.InferOutput<typeof adDomainSchema>;
