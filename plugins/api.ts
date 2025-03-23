export default defineNuxtPlugin({
  setup() {
    const api = $fetch.create({
      baseURL: useRuntimeConfig().public.apiBaseUrl ?? "http://localhost:8081",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return {
      provide: {
        api,
      },
    };
  },
});
