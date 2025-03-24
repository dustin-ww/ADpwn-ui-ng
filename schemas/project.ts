// ~/schemas/project.ts
import * as v from "valibot";

// Schema als Wert
export const projectUpdateSchema = v.object({
  name: v.pipe(v.string(), v.minLength(3, "Must be at least 3 characters")),
  description: v.pipe(v.string()),
});

// Typ-Definition
export type ProjectUpdateSchema = v.InferOutput<typeof projectUpdateSchema>;
