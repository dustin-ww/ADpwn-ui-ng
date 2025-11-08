// composables/useCookieSync.ts
export function useCookieSync(storeName: string) {
  return {
    hydrate(state: Record<string, any>, keys: string[]) {
      keys.forEach(key => {
        const cookie = useCookie(`${storeName}-${key}`, { default: () => '' });
        state[key] = cookie.value;
      });
    },
    
    sync(state: Record<string, any>, keys: string[]) {
      keys.forEach(key => {
        const cookie = useCookie(`${storeName}-${key}`);
        cookie.value = state[key];
      });
    }
  };
}