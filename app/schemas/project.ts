import { z } from "zod";

// Schema als Wert
export const projectUpdateSchema = z.object({
  name: z.string().min(3, "Must be at least 3 characters"),
  description: z.string(),
});

export const projectCreateSchema = z.object({
  name: z.string().min(3, "Must be at least 3 characters"),
  description: z.string(),
});

// Typ-Definition
export type ProjectUpdateSchema = z.infer<typeof projectUpdateSchema>;
export type ProjectCreateSchema = z.infer<typeof projectCreateSchema>;