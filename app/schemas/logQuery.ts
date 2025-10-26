import { z } from "zod";

export const logQueryOptionsSchema = z.object({
  // Pagination
  page: z.number().int().min(1).optional(),
  pageSize: z.number().int().min(1).max(1000).optional(),
  
  // Search/Filter
  searchTerm: z.string().optional(),
  eventTypes: z.array(z.string()).optional(),
  moduleKeys: z.array(z.string()).optional(),
  
  // Sorting
  sortBy: z.string().optional(),
  sortOrder: z.enum(['ASC', 'DESC']).optional(),
  
  // Time range
  startTime: z.union([z.date(), z.string().datetime()]).optional(),
  endTime: z.union([z.date(), z.string().datetime()]).optional(),
});

export type LogQueryOptionsSchema = z.infer<typeof logQueryOptionsSchema>;