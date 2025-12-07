import type { AckMessage } from "~/types/Game"

export const useConnectionEvent = (eventName: string, handler: (...args: any[]) => any) => {
  const connectionStore = useConnectionStore()
  onMounted(() => connectionStore.on(eventName, handler))
  onUnmounted(() => connectionStore.off(eventName, handler))
}

export const useAcknowledgeableEvent = (eventName: string, handler: (...args: any[]) => any) => {
  const connectionStore = useConnectionStore()

  const ackHandler = (wrapper: AckMessage) => {
    console.log("ack message received")
    connectionStore.invoke("ack", wrapper.messageId)
    handler(wrapper.message)
  }

  onMounted(() => connectionStore.on(eventName, ackHandler))
  onUnmounted(() => connectionStore.off(eventName, ackHandler))
}
