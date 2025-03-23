// types/api.ts
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ApiResponse<T = unknown> = {
  data?: T;
  error?: ApiError;
  status?: number;
};

export type ApiError = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  status?: number;
};
