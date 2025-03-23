import { object, string, type InferType } from "yup";

export const ProjectUpdateSchema = object({
  name: string().optional(),
  description: string().optional(),
});

export type ProjectUpdateSchema = InferType<typeof ProjectUpdateSchema>;
