// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  modules: ['@nuxt/ui', '@pinia/nuxt'],
  css: ['~/assets/css/main.css'],
  vite: {
    server: {
      watch: {
        usePolling: true,
        interval: 100,
      }
    }
  },
  runtimeConfig: {
    // Nur server-seitig verfügbar
    apiBaseUrl: 'http://localhost:8081',
    
    public: {
      // Auch client-seitig verfügbar
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8081',
    }
  },
  devtools: { enabled: true },
   devServer: {
    host: '127.0.0.1',
    port: 4000
  }
})