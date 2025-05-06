// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },

  devServer: {
    host: "localhost",
    https: {
      key: "../localhost-key.pem",
      cert: "../localhost.pem",
    },
  },

  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_API_URL,
      reownProjectId: process.env.REOWN_PROJECT_ID,
    },
  },

  nitro: {
    devProxy: {
      "/api/**": {
        target: `${process.env.NUXT_API_URL}/**`,
        secure: true,
      },
    },
  },

  vite: {
    optimizeDeps: {
      // https://github.com/wevm/wagmi/issues/3977
      include: ["eventemitter3"],
    },
  },

  vue: {
    compilerOptions: {
      isCustomElement: (tag) => ["appkit-connect-button", "piece"].includes(tag),
    },
  },

  ssr: false,

  plugins: ["~/plugins/connectWallet.client.ts"],
  modules: ["@pinia/nuxt", "@nuxt/ui", "@nuxt/icon", "@nuxt/image", "@vueuse/nuxt"],
  css: ["~/assets/css/main.css"],
  ui: {
    theme: {
      colors: ["primary", "secondary", "tertiary", "info", "success", "warning", "error", "neutral"],
    },
  },
})