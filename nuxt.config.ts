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
      serverAddress: process.env.SERVER_ADDRESS,
      reownProjectId: process.env.REOWN_PROJECT_ID,
      pinataJwt: process.env.PINATA_JWT,
      ipfsGateway: process.env.IPFS_GATEWAY,
      moralisApiKey: process.env.MORALIS_API_KEY,
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
