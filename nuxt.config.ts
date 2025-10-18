import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-10-18',
  css: [
    "~/assets/css/main.css", 
    "v-network-graph/lib/style.css",
  ],
  modules: [
    "@nuxt/ui",
    "@pinia/nuxt",
    "@nuxt/icon",
    "pinia-plugin-persistedstate/nuxt",
    "@nuxt/eslint",
    "@vee-validate/nuxt",
  ],
  devtools: { enabled: false },
  vite: {
    plugins: [
      tailwindcss(),
    ],
    server: {
      watch: {
        usePolling: true,
        interval: 100,
      }
    }
  },
  runtimeConfig: {
    apiSecret: process.env.API_SECRET,
    // Server-only (private)
    apiBaseUrl: process.env.API_BASE_URL || 'http://adpwn-core:8081',
    public: {
      // Client & Server (public)
      apiBaseUrl: '/api',
    },
  },
  nitro: {
    // Proxy for dev container development
    devProxy: {
      '/api': {
        target: 'http://adpwn-core:8081',
        changeOrigin: true,
      }
    }
  },
  app: {
    head: {
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    },
  },
  devServer: {
    host: '0.0.0.0',
    port: 3000
  }
});