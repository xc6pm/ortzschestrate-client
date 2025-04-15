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
      serverAddress: process.env.SERVER_ADDRESS,
      reownProjectId: process.env.REOWN_PROJECT_ID,
    },
  },

  nitro: {
    devProxy: {
      "/api/**": {
        target: `${process.env.SERVER_ADDRESS}/**`,
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
      isCustomElement: (tag) => ["appkit-connect-button"].includes(tag),
    },
  },

  oauth: {
    endpoints: {
      authorization: "https://accounts.google.com/o/oauth2/v2/auth",
      token: "/api/auth/google-token",
      userInfo: "/api/auth/user",
      logout: "/api/auth/logout",
    },
    redirect: {
      callback: "/google-cb",
      logout: "/api/auth/logout",
    },
    clientId: "284791964116-hrdb5qr6a3g2beraffjuqjfhfed1odtu.apps.googleusercontent.com",
    scope: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
      "openid",
    ],
  },

  ssr: false,

  plugins: ["~/plugins/connectWallet.client.ts"],
  modules: ["@pinia/nuxt", "@nuxt/ui", "@nuxt/icon", "@nuxt/image", "@xc6pm/nuxt-oauth"],
  css: ["~/assets/css/main.css"],
  ui: {
    theme: {
      colors: ["primary", "secondary", "tertiary", "info", "success", "warning", "error", "neutral"],
    },
  },
})
