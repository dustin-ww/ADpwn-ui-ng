export interface LogQueryOptions {
  // Pagination
  page?: number;       
  pageSize?: number;   
  
  // Search/Filter
  searchTerm?: string;  
  eventTypes?: string[]; 
  moduleKeys?: string[]; 
  
  // Sorting
  sortBy?: string;   
  sortOrder?: 'ASC' | 'DESC'; 
  
  // Time range
  startTime?: Date | string; 
  endTime?: Date | string; 
}