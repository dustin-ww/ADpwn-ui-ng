import * as v from 'valibot';

export const logQueryOptionsSchema = v.object({
  // Pagination
  page: v.optional(v.pipe(v.number(), v.integer(), v.minValue(1))),
  pageSize: v.optional(v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(1000))),
  
  // Search/Filter
  searchTerm: v.optional(v.string()),
  eventTypes: v.optional(v.array(v.string())),
  moduleKeys: v.optional(v.array(v.string())),
  
  // Sorting
  sortBy: v.optional(v.string()),
  sortOrder: v.optional(v.picklist(['ASC', 'DESC'])),
  
  // Time range
  startTime: v.optional(v.union([v.date(), v.pipe(v.string(), v.isoDateTime())])),
  endTime: v.optional(v.union([v.date(), v.pipe(v.string(), v.isoDateTime())])),
});

export type LogQueryOptionsSchema = v.InferOutput<typeof logQueryOptionsSchema>;
