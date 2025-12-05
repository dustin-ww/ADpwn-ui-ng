// composables/api/useApiWrapper.ts
import type { ApiResponse, ApiError, HttpMethod } from "~/app/types/api";
import { convertKeysToCamelCase, convertKeysToSnakeCase  } from "./caseConverter";

export const useApiClient = () => {
  const { $api } = useNuxtApp();
  const runtimeConfig = useRuntimeConfig();
  const baseURL = runtimeConfig.public.apiBaseUrl;

  const normalizeError = (error: unknown): ApiError => {
    if (error instanceof Error) {
      return {
        code: "UNKNOWN_ERROR",
        message: error.message,
      };
    }
    if (typeof error === "object" && error !== null) {
      const e = error as Record<string, unknown>;
      return {
        code: String(e.code || "UNKNOWN_ERROR"),
        message: String(e.message || "Unknown error occurred"),
        details: (e.details as Record<string, unknown>) || undefined,
      };
    }
    return {
      code: "UNKNOWN_ERROR",
      message: String(error),
    };
  };

  const request = async <T>(
    endpoint: string,
    method: HttpMethod = "GET",
    data?: unknown,
    customHeaders?: Record<string, string>,
  ): Promise<ApiResponse<T>> => {
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...customHeaders,
    };

    // Convert all keys in the request data to snake_case
    const requestData = data ? convertKeysToSnakeCase(data) : undefined;

    try {
      const response = await $api(endpoint, {
        baseURL,
        method,
        headers,
        body: method !== "GET" ? requestData : undefined,
        query: method === "GET" ? requestData : undefined,
        credentials: "include",
      });

      // Convert all keys in the response data to camelCase
      const convertedData = convertKeysToCamelCase<T>(response);

      return {
        data: convertedData,
        error: undefined,
      };
    } catch (error) {
      const normalizedError = normalizeError(error);
      return {
        data: undefined as unknown as T,
        error: normalizedError,
      };
    }
  };

  return {
    get: <T>(endpoint: string, query?: Record<string, unknown>) =>
      request<T>(endpoint, "GET", query),
    create: <T>(endpoint: string, data: unknown) =>
      request<T>(endpoint, "POST", data),
    update: <T>(
      endpoint: string,
      data: unknown,
      options?: { headers?: Record<string, string> },
    ) => request<T>(endpoint, "PATCH", data, options?.headers),
    replace: <T>(endpoint: string, data: unknown) =>
      request<T>(endpoint, "PUT", data),
    delete: <T>(endpoint: string) => request<T>(endpoint, "DELETE"),
    customRequest: <T>(
      endpoint: string,
      method: HttpMethod,
      options?: {
        data?: unknown;
        headers?: Record<string, string>;
        query?: Record<string, unknown>;
      },
    ) => request<T>(endpoint, method, options?.data, options?.headers),
  };
};