import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query"
import { WagmiPlugin } from "@wagmi/vue"

export default defineNuxtPlugin((nuxtApp) => {
  const queryClient = new QueryClient()
  const { config } = useWagmi()

  nuxtApp.vueApp.use(WagmiPlugin, { config }).use(VueQueryPlugin, { queryClient })
})
