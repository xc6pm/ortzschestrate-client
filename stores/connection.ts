import * as signalr from "@microsoft/signalr"

export const useConnectionStore = defineStore("connectionStore", () => {
  const connection = ref<signalr.HubConnection | null>()
  const state = computed(() => connection.value?.state)
  const reconnectionStatus = ref("")

  const resolveRunningConnection = async (): Promise<signalr.HubConnection> => {
    if (connection.value) {
      if (connection.value.connectionId) return Promise.resolve(connection!.value!)

      await connection.value.start()
      return connection.value
    }

    const config = useRuntimeConfig()
    const server = config.public.apiUrl.split("/api")[0]

    const conn = new signalr.HubConnectionBuilder()
      .withUrl(server + "/hubs/game")
      .withAutomaticReconnect()
      .build()

    conn.onreconnecting((error) => {
      console.warn("Reconnecting...", error)
      reconnectionStatus.value = "Reconnecting..."
    })

    conn.onreconnected((connectionId) => {
      console.log("Reconnected")
      reconnectionStatus.value = ""
    })

    await conn.start()

    connection.value = conn

    return connection.value
  }

  const invoke = async (methodName: string, ...args: any[]) => {
    const conn = await resolveRunningConnection()
    const res = await conn.invoke(methodName, ...args)
    return res
  }

  const on = (methodName: string, handler: (...args: any[]) => any) => {
    connection.value?.on(methodName, handler)
  }

  const off = (methodName: string, handler: (...args: any[]) => any) => {
    connection.value?.off(methodName, handler)
  }

  return { invoke, on, off, state, reconnectionStatus }
})
