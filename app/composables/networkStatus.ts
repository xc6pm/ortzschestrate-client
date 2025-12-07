import { ref } from "vue"
import type { Ref } from "vue"

type NetworkStatus = {
  isOnline: Ref<boolean>
  lastChecked: Ref<number | null>
  start: () => void
  stop: () => void
}

let singleton: NetworkStatus | null = null

const PING_URL = "/ping.json"
const PING_INTERVAL = 10_000

const createNetworkStatus = (): NetworkStatus => {
  const isOnline = ref<boolean>(true)
  const lastChecked = ref<number | null>(null)
  let intervalId: number | null = null

  const ping = async () => {
    // only run in browsers
    if (typeof window === "undefined") return

    try {
      // avoid cached responses
      const res = await fetch(PING_URL, { cache: "no-store" })
      lastChecked.value = Date.now()
      // If the file exists the server will return the json, in case of 404s the server returns an html file instead of http error
      isOnline.value = res.headers.get("content-type")?.startsWith("application/json") === true
    } catch (e) {
      lastChecked.value = Date.now()
      isOnline.value = false
    }
  }

  const start = () => {
    if (intervalId != null) return
    // do an immediate check, then start interval
    void ping()
    intervalId = window.setInterval(ping, PING_INTERVAL)
  }

  const stop = () => {
    if (intervalId != null) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  // start automatically in client
  if (typeof window !== "undefined") start()

  return { isOnline, lastChecked, start, stop }
}

export function useNetworkStatus() {
  if (!singleton) {
    singleton = createNetworkStatus()
  }

  return {
    isOnline: singleton.isOnline,
    lastChecked: singleton.lastChecked,
    start: singleton.start,
    stop: singleton.stop,
  }
}
