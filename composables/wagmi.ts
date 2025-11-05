import { WagmiAdapter } from "@reown/appkit-adapter-wagmi"
import type { AppKitNetwork } from "@reown/appkit/networks"
import { createConfig, injected } from "@wagmi/vue"
import { metaMask, safe, walletConnect } from "@wagmi/vue/connectors"
import { defineChain, http } from "viem"
import { hardhat, sepolia, type Chain } from "viem/chains"

let wagmiProps: { wagmiAdapter: WagmiAdapter; projectId: string; config: any; networks: AppKitNetwork[] } | null = null

const initWagmi = (projectId: string) => {
  let hardhatLocalhost: Chain | null = null
  // if (import.meta.dev) {
  //   hardhatLocalhost = defineChain({
  //     id: 31_337,
  //     chainNamespace: "eip155",
  //     caipNetworkId: "eip155:31337",
  //     name: "Localhost",
  //     nativeCurrency: {
  //       decimals: 18,
  //       name: "Ether",
  //       symbol: "ETH",
  //     },
  //     rpcUrls: {
  //       default: { http: ["http://127.0.0.1:8545"] },
  //     },
  //     testnet: true,
  //   })
  // }

  const chains: [Chain, ...Chain[]] = hardhatLocalhost ? [hardhatLocalhost, sepolia] : [sepolia]
  // const transports = hardhatLocalhost
  // ? { [sepolia.id]: http(), [hardhatLocalhost.id]: http() }
  // : { [sepolia.id]: http() }
  const transports = { [sepolia.id]: http() }

  const config = createConfig({
    chains,
    transports,
    connectors: [injected(), metaMask(), safe(), walletConnect({ projectId })],
  })

  const networks: [AppKitNetwork, ...AppKitNetwork[]] = chains

  const wagmiAdapter = new WagmiAdapter({
    networks,
    projectId,
  })

  wagmiProps = { wagmiAdapter, projectId, config, networks }
}

export const useWagmi = () => {
  const projectId = useRuntimeConfig().public.reownProjectId
  if (!projectId) throw new Error("The wallet button requires a reown project id to work.")

  if (wagmiProps) return wagmiProps

  initWagmi(projectId)
  return wagmiProps!
}
