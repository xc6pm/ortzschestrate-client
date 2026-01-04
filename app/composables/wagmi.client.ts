import { WagmiAdapter } from "@reown/appkit-adapter-wagmi"
import type { AppKitNetwork } from "@reown/appkit/networks"
import { AppKit, createAppKit, type ThemeMode } from "@reown/appkit/vue"
import { createConfig, injected } from "@wagmi/vue"
import { metaMask, safe, walletConnect } from "@wagmi/vue/connectors"
import { http } from "viem"
import { polygonAmoy, type Chain } from "viem/chains"

type WagmiProps = {
  wagmiAdapter: WagmiAdapter
  projectId: string
  config: ReturnType<typeof createConfig>
  networks: AppKitNetwork[]
  chains: Chain[]
  modal: AppKit
}

let wagmiProps: WagmiProps | null = null

const initWagmi = (projectId: string): WagmiProps => {
  const chains: [Chain, ...Chain[]] = [polygonAmoy]
  const transports = { [polygonAmoy.id]: http() }

  const config = createConfig({
    chains,
    transports,
    connectors: import.meta.server ? [] : [injected(), metaMask(), safe(), walletConnect({ projectId })],
    ssr: true,
  })

  const networks: [AppKitNetwork, ...AppKitNetwork[]] = chains

  const wagmiAdapter = new WagmiAdapter({
    networks,
    projectId,
  })

  const requestUrl = useRequestURL()
  console.log("origin", requestUrl.origin)

  const metadata = {
    name: "Nietzschess",
    description: "Nietzschess Web3 Chess Platform",
    url: import.meta.client ? window.location.origin : requestUrl.origin,
    icons: ["https://avatars.githubusercontent.com/u/179229932"],
  }

  const colorMode = useColorMode()

  const modal = createAppKit({
    adapters: [wagmiAdapter],
    networks: [networks[0], ...networks],
    enableReconnect: false,
    projectId,
    metadata,
    features: {
      analytics: true, // Optional - defaults to your Cloud configuration
      send: false,
      swaps: false,
      receive: false,
      onramp: false,
    },
    themeMode: colorMode.value as ThemeMode,

    themeVariables: {
      "--w3m-accent": "#435063",
      "--w3m-border-radius-master": ".85px",
    },
  })

  return { wagmiAdapter, projectId, config, networks, chains, modal }
}

export const useWagmi = () => {
  const projectId = useRuntimeConfig().public.reownProjectId
  if (!projectId) throw new Error("The wallet button requires a reown project id to work.")

  if (!wagmiProps) {
    wagmiProps = initWagmi(projectId)
  }

  return wagmiProps
}
