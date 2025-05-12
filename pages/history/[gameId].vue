<script setup lang="ts">
import type { BoardConfig } from "vue3-chessboard"
import { BoardApi, TheChessboard } from "vue3-chessboard"
import "vue3-chessboard/style.css"
import type { FinishedGame } from "~/types/Game"

const gameId = useRoute().params.gameId as string

const game =
  useRecentGamesStore().recentGames.find((g) => g.id === gameId) ??
  (await $fetch<FinishedGame>(apiUrl("/history/game"), {
    method: "get",
    params: { id: gameId },
    credentials: "include",
    ignoreResponseError: true,
  }))

if (!game) {
  const toast = useToast()
  toast.add({
    color: "error",
    title: "Couldn't find that game in history",
  })
  await navigateTo("/")
}

const { isMobile } = useIsMobile()
const userStore = useUserStore()

const playerIdx = game?.players[0].userId === userStore.user!.id ? 0 : 1
const opponentIdx = playerIdx === 0 ? 1 : 0
const opponent = game!.players[opponentIdx].name

const playerColor = game?.playerColors[playerIdx] === "w" ? "white" : "black"
const boardConfig: BoardConfig = {
  orientation: playerColor,
  premovable: { enabled: false },
  predroppable: { enabled: false },
  viewOnly: true,
}

const moveHistory = shallowRef<string[]>([])

const playerCapturedPieces = ref<string[]>([])
const opponentCapturedPieces = ref<string[]>([])

let boardApi: BoardApi | null
const onBoardCreated = (api: BoardApi) => {
  boardApi = api

  boardApi.loadPgn(game!.pgn!)

  moveHistory.value = boardApi.getHistory()

  playerCapturedPieces.value =
    playerColor === "white" ? boardApi.getCapturedPieces().white : boardApi.getCapturedPieces().black
  opponentCapturedPieces.value =
    playerColor === "white" ? boardApi.getCapturedPieces().black : boardApi.getCapturedPieces().white
}

const winner =
  game?.wonSide === null
    ? null
    : game?.wonSide === game?.playerColors[0]
    ? game?.players[0].name
    : game?.players[1].name

</script>

<template>
  <UCard class="mt-2 mx-auto max-w-[700px] lg:max-w-[960px] bg-shamrock-500 dark:bg-shamrock-700">
    <p v-if="winner">
      {{ winner === userStore.user?.userName ? 'You ' : winner }} won this game by {{ game?.endgameType === "Resigned" ? "resignation" : game?.endgameType }}
    </p>
    <p v-else>Game ended in a draw by {{ game?.endgameType }}</p>
  </UCard>

  <section
    class="flex h-[calc(100vh-73px)] overflow-auto md:h-auto md:overflow-visible flex-col lg:flex-row justify-center w-full lg:max-w-[950px] mx-auto"
  >
    <section class="flex-1 flex flex-col justify-between content-between">
      <UCard id="opponentCard" class="my-2 mx-auto w-full max-w-full md:max-w-[700px]" :ui="{ body: 'sm:py-2' }">
        <div class="flex flex-row justify-between items-center">
          <span class="flex flex-row items-center">{{ opponent }}</span>

          <div class="flex flex-row items-center">
            <ChessCapturedPieces :items="opponentCapturedPieces" :color="game?.playerColors[opponentIdx]!" />

            <ChessTimer
              :run="false"
              :duration="game?.remainingTimesInMs[opponentIdx]"
              ref="opponentTimer"
              class="mt-0.5"
            />
          </div>
        </div>
      </UCard>

      <TheChessboard
        :player-color="playerColor"
        :board-config="boardConfig"
        @board-created="onBoardCreated"
        :reactive-config="true"
        class="max-w-[700px]"
      />

      <div>
        <UCard
          id="playerCard"
          class="mt-2 lg:mb-2 mx-auto w-full max-w-full md:max-w-[700px]"
          :ui="{ body: 'sm:py-2' }"
        >
          <div class="flex justify-between items-center">
            <span>{{ userStore.user?.userName }}</span>

            <div class="flex flex-row items-center">
              <ChessCapturedPieces :items="playerCapturedPieces" :color="game?.playerColors[playerIdx]!" />

              <ChessTimer
                :run="false"
                :duration="game?.remainingTimesInMs[playerIdx]"
                ref="playerTimer"
                class="mt-0.5"
              />
            </div>
          </div>
        </UCard>

        <div v-if="isMobile" class="mx-0 mt-2 bg-gray-100 dark:bg-gray-900">
          <ChessMobileMoveRecord :moves-played="moveHistory" :key="moveHistory.length" class="max-w-[700px] mx-auto" />
        </div>
      </div>
    </section>

    <aside v-if="!isMobile" class="flex flex-1/4 flex-col min-w-[200px] max-w-[250px]">
      <ChessDesktopMoveRecord :moves-played="moveHistory" :show-resign-button="false" :key="moveHistory.length" class="m-2 w-full" />
    </aside>
  </section>
</template>
