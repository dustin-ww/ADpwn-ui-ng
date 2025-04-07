import type { Ref } from "vue";
import { ref } from "vue";

export interface CacheConfig {
  [key: string]: number | null;
}

export interface ApiResponse<T> {
  data?: T[];
}

export interface BaseStoreState {
  loading: boolean;
  error: Error | null;
  cache: CacheConfig;
}

const DEFAULT_CACHE_DURATION = 5 * 60 * 1000;

export function useBaseStore<T extends BaseStoreState>(storeName: string) {
  const loading = ref(false);

  function getCacheDuration(): number {
    // try {
    //   const config = useRuntimeConfig();
    //   return config.public?.cacheDuration || DEFAULT_CACHE_DURATION;
    // } catch (error) {
    //   console.warn('Could not access RuntimeConfig, using default cache duration');
    //   return DEFAULT_CACHE_DURATION;
    // }
    return DEFAULT_CACHE_DURATION;
  }

  // Validate if cached data is still valid
  function isCacheValid(
    cacheTimestamp: number | null,
    duration?: number,
  ): boolean {
    const now = Date.now();
    const cacheDuration = duration || getCacheDuration();
    return cacheTimestamp !== null && now - cacheTimestamp < cacheDuration;
  }

  // Generic API call handler with loading state management
  async function handleApiCall<R>(
    apiCall: () => Promise<R>,
    onSuccess: (data: R) => void,
    onError?: (error: unknown) => void,
    useLoadingRef?: Ref<boolean>,
  ) {
    const loadingRef = useLoadingRef || loading;
    loadingRef.value = true;

    try {
      const response = await apiCall();
      onSuccess(response);
      return response;
    } catch (error) {
      if (onError) {
        onError(error);
      } else {
        handleError(error);
      }
      if (import.meta.client) {
        console.error(`[${storeName}]`, error);
      }
      return null;
    } finally {
      loadingRef.value = false;
    }
  }

  // Standardized error handling with toast notifications
  function handleError(error: unknown, errorRef?: Ref<Error | null>) {
    const errorInstance =
      error instanceof Error ? error : new Error(String(error));

    if (errorRef) {
      errorRef.value = errorInstance;
    }

    if (import.meta.client) {
      try {
        const toast = useToast();
        toast.add({
          title: `Error in ${storeName}`,
          description: errorInstance.message || "Unknown error",
          color: "error",
        });
      } catch (hookError) {
        console.error("Error in error handler:", hookError);
      }
    }

    return errorInstance;
  }

  // Cache invalidation utility
  function invalidateCache(cache: CacheConfig, key?: string) {
    if (key) {
      cache[key] = null;
    } else {
      Object.keys(cache).forEach((k) => {
        cache[k] = null;
      });
    }
  }

  // Simplified fetcher with cache management
  function createFetcher<R>(store: T) {
    return function <K extends keyof T["cache"]>(
      fetchFn: () => Promise<ApiResponse<R>>,
      cacheKey: K & string,
      updateState: (data: R[]) => void,
      options?: {
        skipCache?: boolean;
        cacheDuration?: number;
        customLoadingRef?: Ref<boolean>;
      },
    ) {
      return async () => {
        const cacheDuration = options?.cacheDuration || getCacheDuration();
        const loadingRef = options?.customLoadingRef || ref(store.loading);

        // Skip cache check if requested or on server
        if (
          !options?.skipCache &&
          !import.meta.server &&
          isCacheValid(store.cache[cacheKey] ?? null, cacheDuration)
        ) {
          return;
        }

        return handleApiCall(
          fetchFn,
          (response) => {
            updateState(response.data ?? []);
            store.cache[cacheKey] = import.meta.client ? Date.now() : null;
          },
          (error) => handleError(error, ref(store.error)),
          loadingRef,
        );
      };
    };
  }

  // Simplified entity creator
  function createEntityCreator<R>(store: T) {
    return function <K extends keyof T["cache"]>(
      createFn: () => Promise<ApiResponse<R>>,
      entityType: K & string,
      entityArray: R[],
      options?: {
        successToast?: boolean;
        customLoadingRef?: Ref<boolean>;
      },
    ) {
      return async () => {
        const loadingRef = options?.customLoadingRef || ref(store.loading);

        return handleApiCall(
          createFn,
          (response) => {
            if (response.data) {
              entityArray.push(...response.data);
              invalidateCache(store.cache, entityType);

              if (options?.successToast && import.meta.client) {
                try {
                  const toast = useToast();
                  toast.add({
                    title: "Success",
                    description: `${String(entityType).charAt(0).toUpperCase() + String(entityType).slice(1)} created successfully.`,
                    color: "success",
                  });
                } catch (error) {
                  console.error("Error showing success toast:", error);
                }
              }
            } else {
              throw new Error(`${entityType} creation response is undefined`);
            }
          },
          (error) => handleError(error, ref(store.error)),
          loadingRef,
        );
      };
    };
  }

  return {
    loading,
    handleApiCall,
    handleError,
    invalidateCache,
    isCacheValid,
    getCacheDuration,
    createFetcher,
    createEntityCreator,
  };
}
