export function isCacheValid(cacheTimestamp: number | null, duration: number): boolean {
    const now = Date.now();
    return cacheTimestamp !== null && now - cacheTimestamp < duration;
  }
  
  export async function handleApiCall<T>(
    apiCall: () => Promise<T>,
    onSuccess: (data: T) => void,
    onError: (error: unknown) => void,
    loadingRef: { value: boolean }
  ) {
    loadingRef.value = true;
    try {
      const response = await apiCall();
      onSuccess(response);
    } catch (error) {
      onError(error);
    } finally {
      loadingRef.value = false;
    }
  }