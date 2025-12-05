import { WagmiAdapter } from "@reown/appkit-adapter-wagmi"
import type { AppKitNetwork } from "@reown/appkit/networks"
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

  return { wagmiAdapter, projectId, config, networks, chains }
}

export const useWagmi = () => {
  const projectId = useRuntimeConfig().public.reownProjectId
  if (!projectId) throw new Error("The wallet button requires a reown project id to work.")

  if (!wagmiProps) {
    wagmiProps = initWagmi(projectId)
  }

  return wagmiProps
}
