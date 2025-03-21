import * as signalr from "@microsoft/signalr"

export const useConnectionStore = defineStore("connectionStore", () => {
  const connection = ref<signalr.HubConnection | null>()

  const resolveRunningConnection = async (): Promise<signalr.HubConnection> => {
    if (connection.value) {
      if (connection.value.connectionId) return Promise.resolve(connection!.value!)

      await connection.value.start()
      return connection.value
    }

    const server = process.env.NUXT_API_URL?.split("/api")[0]

    const conn = new signalr.HubConnectionBuilder()
      .withUrl(server + "/hubs/game")
      .withAutomaticReconnect()
      .build()

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

  return { invoke, on, off }
})
