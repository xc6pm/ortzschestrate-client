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

  routeRules: {
    "/": { swr: true },
    "/**": { swr: true },
    "/auth/**": { ssr: false },
    "/game/**": { ssr: false },
    "/history/**": { swr: true },
    "/shop/**": { swr: true },
    "/shop/owned": { ssr: false },
    "/functions/ipfs/**": { swr: true, cache: false },
    "/functions/nfts/**": { swr: true, cache: false },
    "/functions/nfts/byWallet/**": { swr: true, cache: false },
    "/deployment/**": { swr: true },
  },

  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_API_URL,
      serverAddress: process.env.SERVER_ADDRESS,
      reownProjectId: process.env.REOWN_PROJECT_ID,
      ipfsGateway: process.env.IPFS_GATEWAY,
      nftMarketplaceSubgraphUrl: process.env.NFT_MARKETPLACE_SUBGRAPH_URL,
    },

    pinataJwt: process.env.PINATA_JWT,
    moralisApiKey: process.env.MORALIS_API_KEY,
    theGraphStudioApiKey: process.env.THE_GRAPH_STUDIO_API_KEY,
    goldRushApiKey: process.env.GOLDRUSH_API_KEY,
    ankrApiKey: process.env.ANKR_API_KEY,
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

  plugins: ["~/plugins/connectWallet.ts"],
  modules: ["@pinia/nuxt", "@nuxt/ui", "@nuxt/icon", "@nuxt/image", "@vueuse/nuxt"],
  css: ["~/assets/css/main.css"],
  ui: {
    theme: {
      colors: ["primary", "secondary", "tertiary", "info", "success", "warning", "error", "neutral"],
    },
  },
})
