import { defineChain, type AppKitNetwork, type Chain } from "@reown/appkit/networks"
import { http, createConfig } from "@wagmi/vue"
import { sepolia } from "@wagmi/vue/chains"

let hardhatLocalhost: Chain | null = null
if (import.meta.dev) {
  hardhatLocalhost = defineChain({
    id: 31_337,
    chainNamespace: "eip155",
    caipNetworkId: "eip155:31337",
    name: "Localhost",
    nativeCurrency: {
      decimals: 18,
      name: "Ether",
      symbol: "ETH",
    },
    rpcUrls: {
      default: { http: ["http://127.0.0.1:8545"] },
    },
    testnet: true,
  })
}

const chains: [Chain, ...Chain[]] = hardhatLocalhost ? [hardhatLocalhost, sepolia] : [sepolia]
const transports = hardhatLocalhost ? { [sepolia.id]: http(), [hardhatLocalhost.id]: http() } : { [sepolia.id]: http() }
const config = createConfig({
  chains,
  transports,
})

const networks: [AppKitNetwork, ...AppKitNetwork[]] = chains

export { config, networks }

declare module "@wagmi/vue" {
  interface Register {
    config: typeof config
  }
}
