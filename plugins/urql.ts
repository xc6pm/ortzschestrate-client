import { createClient, ssrExchange, fetchExchange, cacheExchange, install } from "@urql/vue"

export default defineNuxtPlugin((nuxtApp) => {
  const { nftMarketplaceSubgraphUrl, theGraphStudioApiKey } = useRuntimeConfig().public

  const ssr = ssrExchange({
    isClient: import.meta.client,
  })

  if (import.meta.client) {
    const data = nuxtApp.payload.data["urql-data"]
    if (data) {
      ssr.restoreData(data)
    }
  }

  if (import.meta.server) {
    nuxtApp.hook("app:rendered", () => {
      nuxtApp.payload.data["urql-data"] = ssr.extractData()
    })
  }

  const client = createClient({
    url: nftMarketplaceSubgraphUrl as string,
    exchanges: [ssr, cacheExchange, fetchExchange],
    preferGetMethod: false,
    fetchOptions: () => {
      return {
        headers: { Authorization: `Bearer ${theGraphStudioApiKey}`, ContentType: "application/json" },
        method: "POST",
      }
    },
  })

  nuxtApp.vueApp.use(install, client)
})
