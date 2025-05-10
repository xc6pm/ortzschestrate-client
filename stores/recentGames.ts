import type { AckMessage, FinishedGame } from "~/types/Game"

export const useRecentGamesStore = defineStore("recentGamesStore", () => {
  const recentGames = shallowRef<FinishedGame[]>([])
  const connectionStore = useConnectionStore()

  const loadRecentGames = async (page: number = 1) => {
    if (page < 1) return

    try {
      if (page === 1) {
        recentGames.value = await $fetch<FinishedGame[]>(apiUrl("/history/games"), {
          method: "GET",
          params: { page },
          credentials: "include",
        })
      } else {
        const g = await $fetch<FinishedGame[]>(apiUrl("/history/games"), {
          method: "GET",
          params: { page },
          credentials: "include",
        })

        recentGames.value = recentGames.value.concat(g)
      }
    } catch (error) {
      console.error("Error fetching recent games:", error)
    }
  }

  connectionStore.on("GameHistoryUpdated", (ackMessage: AckMessage) => {
    connectionStore.invoke("ack", ackMessage.messageId)
    const addedGame: FinishedGame = ackMessage.message

    const onePageView = recentGames.value.length / 10 < 2
    let newVal = [addedGame]
      .concat(recentGames.value)
      .sort((a, b) => new Date(b.started).getTime() - new Date(a.started).getTime())
    if (onePageView) {
      newVal = newVal.slice(0, 10)
    }

    recentGames.value = newVal
  })

  loadRecentGames()

  return { recentGames, loadRecentGames }
})
