<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui"
import type { FinishedGameSlim } from "~/types/Game"

definePageMeta({
  middleware: "auth",
})

type ProcessedGame = {
  id: string
  playerColor: "w" | "b"
  opponentName: string
  timeControl: string
  started: Date
  wagered: boolean
  result: "Win" | "Loss" | "Draw"
}

const currentPage = shallowRef<number>(1)
const gamesPerPage = 12
const columns: TableColumn<object>[] = [
  {
    accessorKey: "playerColor",
    header: "Your Color",
    cell: ({ row }) => {
      return h("div", {
        class: `ml-5 w-4 h-4 rounded-sm border-2 border-gray-400 dark:border-gray-600 mx-auto ${
          row.getValue("playerColor") === "w" ? "bg-white" : "bg-black"
        }`,
      })
    },
    size: 12,
  },
  {
    accessorKey: "opponentName",
    header: "Opponent",
    cell: ({ row }) => {
      return h("span", { class: "text-center" }, row.getValue("opponentName"))
    },
  },
  {
    accessorKey: "timeControl",
    header: "Game Type",
    cell: ({ row }) => {
      return h("span", { class: "text-center" }, row.getValue("timeControl"))
    },
    size: 22,
  },
  {
    accessorKey: "started",

    header: "Date & Time",
    cell: ({ row }) => {
      const date = new Date(row.getValue("started"))
      return h(
        "span",
        { class: "text-center" },
        `${date.toLocaleString(undefined, { dateStyle: "medium", hour12: false })}`
      )
    },
  },
  {
    accessorKey: "result",
    header: "Result",
    cell: ({ row }) => {
      const result = row.getValue("result")
      return h(
        "div",
        row.getValue("wagered")
          ? [
              h(
                "span",
                {
                  class: "w-5 h-5 align-middle mr-0.5",
                },
                "🪙"
              ),
              h(
                "span",
                {
                  class: [
                    "inline-flex items-center justify-center w-5 h-5 rounded-sm text-sm font-bold text-white",
                    {
                      "bg-primary-500": row.getValue("result") === "Win",
                      "bg-red-600": row.getValue("result") === "Loss",
                      "bg-gray-500": row.getValue("result") === "Draw",
                    },
                  ],
                },
                row.getValue("result") === "Win" ? "＋" : row.getValue("result") === "Loss" ? "－" : "＝"
              ),
            ]
          : h(
              "span",
              {
                class: [
                  "ml-2.5 inline-flex items-center justify-center w-5 h-5 rounded-sm text-sm font-bold text-white",
                  {
                    "bg-primary-500": row.getValue("result") === "Win",
                    "bg-red-600": row.getValue("result") === "Loss",
                    "bg-gray-500": row.getValue("result") === "Draw",
                  },
                ],
              },
              row.getValue("result") === "Win" ? "＋" : row.getValue("result") === "Loss" ? "－" : "＝"
            )
      )
    },
  },
]
const processedGames = shallowRef<object[]>([])
const gamesCount = shallowRef(0)

const userStore = useUserStore()

const fetchGames = async () => {
  isLoading.value = true

  try {
    if (!gamesCount.value)
      gamesCount.value = await $fetch<number>(apiUrl("/history/games-count"), {
        method: "GET",
        credentials: "include",
      })

    if (currentPage.value < 1 || currentPage.value > gamesCount.value) {
      currentPage.value = 1
      return
    }

    const fetchedGames = await $fetch<FinishedGameSlim[]>(apiUrl("/history/games"), {
      method: "GET",
      params: { page: currentPage.value, pageSize: gamesPerPage },
      credentials: "include",
    })

    processedGames.value = processedGames.value = fetchedGames.map((game) => {
      const userIndex = game.players.findIndex((p) => p.userId === userStore.user?.id)
      const opponentIdx = userIndex === 0 ? 1 : 0
      const userColor = game.playerColors[userIndex]

      const result = game.wonSide === userColor ? "Win" : !game.wonSide ? "Draw" : "Loss"

      return {
        id: game.id,
        playerColor: game.playerColors[userIndex],
        opponentName: game.players[opponentIdx].name || "Unknown",
        timeControl: game.timeControl.name,
        started: new Date(game.started),
        wagered: game.stakeEth > 0,
        result,
      }
    })
  } finally {
    isLoading.value = false
  }
}

const isLoading = ref(false)

watch(currentPage, async () => {
  await fetchGames()
})

await fetchGames()
</script>

<template>
  <UCard class="my-3" :ui="{ header: 'h-14 mb-3' }">
    <template #header>
      <h4 class="text-center text-2xl">Your Game History ({{ gamesCount }})</h4>
    </template>

    <UTable :data="processedGames" :columns="columns" :loading="isLoading" />

    <template #footer>
      <UPagination
        class="mx-auto text-center items-center justify-center px-auto"
        v-model:page="currentPage"
        :total="gamesCount"
        :items-per-page="gamesPerPage"
        :ui="{ list: 'inline-flex items-center gap-1' }"
      />
    </template>
  </UCard>
</template>
