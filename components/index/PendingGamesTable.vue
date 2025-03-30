<script setup lang="ts">
import { UButton } from "#components"
import type { TableColumn } from "@nuxt/ui"
import type { PendingGame } from "~/types/Game"

let userStore = useUserStore()

const pendingGameFields: TableColumn<PendingGame>[] = [
  {
    header: "Opponent",
    cell: ({ row }) => row.original.creator.name,
  },
  {
    header: "Time",
    cell: ({ row }) => row.original.gameType.name,
  },
  {
    header: "Your Color",
    cell: ({ row }) =>
      row.original.creator.userId === userStore.user?.id
        ? row.original.creatorColor.asChar === "w"
          ? "White"
          : "Black"
        : row.original.creatorColor.asChar === "w"
        ? "Black"
        : "White",
  },
  {
    id: "actions",
    cell: ({ row }) =>
      row.original.creator.userId !== userStore.user?.id
        ? h(UButton, {
            label: "Join",
            onClick: () => joinGame(row.original.creator.userId),
            class: "block ml-auto",
          })
        : h(UButton, {
            label: "Cancel",
            onClick: cancelGame,
            class: "block ml-auto",
          }),
  },
]

const connectionStore = useConnectionStore()

const pendingGamesFromServer: PendingGame[] = await connectionStore.invoke("getPending")
const pendingGames = shallowRef<PendingGame[]>(pendingGamesFromServer)

useConnectionEvent("NewGameCreated", (creator) => {
  console.log("new game created by ", creator)
})

useConnectionEvent("LobbyUpdated", (updatedPendingGames: PendingGame[]) => {
  console.log("Pending games ", updatedPendingGames)
  pendingGames.value = updatedPendingGames
})

useConnectionEvent("GameStarted", (gameId) => {
  console.log("Game started", gameId)
  navigateTo("/game/" + gameId)
})

const joinGame = async (opponentUserId: string) => {
  const gameId = await connectionStore.invoke("join", opponentUserId)
  console.log("join invoked", gameId)
  navigateTo("/game/" + gameId)
}

const cancelGame = async () => {
  await connectionStore.invoke("cancel")
  console.log("cancel invoked")
}
</script>

<template>
  <UCard>
    <template #header>
      <h2 class="text-lg text-center">Join someone</h2>
    </template>

    <UTable
      v-if="pendingGames && pendingGames.length"
      :data="pendingGames"
      :columns="pendingGameFields"
      class="flex-1"
    />
    <p class="text-center text-gray-500" v-else>No pending games.</p>
  </UCard>
</template>
