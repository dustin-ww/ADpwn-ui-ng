// composables/api/apiWrapper.ts
import type { ApiResponse, ApiError, HttpMethod } from '~/types/api'

type ApiConfig = {
  baseURL?: string
  defaultHeaders?: Record<string, string>
  withCredentials?: boolean
}

export const createApiWrapper = (config: ApiConfig = {}) => {
  const { $api } = useNuxtApp()
  const runtimeConfig = useRuntimeConfig()
  const baseURL = config.baseURL || runtimeConfig.public.apiBaseUrl

  // Error-Handling
  const normalizeError = (error: unknown): ApiError => {
    if (error instanceof Error) {
      return { 
        code: 'UNKNOWN_ERROR',
        message: error.message 
      }
    }
    
    if (typeof error === 'object' && error !== null) {
      const e = error as Record<string, unknown>
      return {
        code: String(e.code || 'UNKNOWN_ERROR'),
        message: String(e.message || 'Unknown error occurred'),
        details: e.details as Record<string, unknown> || undefined
      }
    }
    
    return {
      code: 'UNKNOWN_ERROR',
      message: String(error)
    }
  }

  // Basis-Request-Methode
  const request = async <T>(
    endpoint: string,
    method: HttpMethod = 'GET',
    data?: unknown,
    customHeaders?: Record<string, string>
  ): Promise<ApiResponse<T>> => {
    const headers = {
      ...config.defaultHeaders,
      ...customHeaders,
      'Content-Type': 'application/json'
    }

    try {
      const response = await $api<T>(endpoint, {
        baseURL,
        method,
        headers,
        body: method !== 'GET' ? data : undefined,
        query: method === 'GET' ? data : undefined,
        credentials: config.withCredentials ? 'include' : 'same-origin'
      })

      return { 
        data: response,
        error: undefined
      }
    } catch (error) {
      const normalizedError = normalizeError(error)
      
      // Globales Error-Handling
      // TODO: ADD ERROR HANDLER
      //useErrorHandler().handle(normalizedError)
      
      return { 
        data: undefined as unknown as T,
        error: normalizedError
      }
    }
  }

  // CRUD-Methoden
  return {
    // GET
    get: <T>(endpoint: string, query?: Record<string, unknown>) => 
      request<T>(endpoint, 'GET', query),

    // POST
    create: <T>(endpoint: string, data: unknown) => 
      request<T>(endpoint, 'POST', data),

    // PATCH
    update: <T>(endpoint: string, data: unknown) => 
      request<T>(endpoint, 'PATCH', data),

    // PUT
    replace: <T>(endpoint: string, data: unknown) => 
      request<T>(endpoint, 'PUT', data),

    // DELETE
    delete: <T>(endpoint: string) => 
      request<T>(endpoint, 'DELETE'),

    // Custom Request
    customRequest: <T>(
      endpoint: string,
      method: HttpMethod,
      options?: {
        data?: unknown
        headers?: Record<string, string>
        query?: Record<string, unknown>
      }
    ) => request<T>(
      endpoint, 
      method, 
      options?.data, 
      options?.headers
    )
  }
}

export const useApiClient = createApiWrapper({
  defaultHeaders: {
    'Accept': 'application/json'
  },
  withCredentials: true
})