import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  css: ["~/assets/css/main.css", "v-network-graph/lib/style.css"],
  modules: [
    "@nuxt/ui",
    "@pinia/nuxt",
    "@nuxt/icon",
    "pinia-plugin-persistedstate/nuxt",
    "@nuxt/eslint",
  ],
  devtools: { enabled: true },
  vite: {
    plugins: [tailwindcss()],
  },
});
