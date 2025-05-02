<script setup lang="ts">
import { BoardApi, TheChessboard, type BoardConfig } from "vue3-chessboard"
import "vue3-chessboard/style.css"
import type { OngoingGame, GameResult, GameUpdate } from "~/types/Game"

const route = useRoute()
const gameId = route.params.id

const userStore = useUserStore()
const connectionStore = useConnectionStore()

const game: OngoingGame = await connectionStore.invoke("getGame", gameId)
console.log("got game", game)
if (!game) {
  const toast = useToast()
  toast.add({ description: "Couldn't find that game!", color: "error" })
  navigateTo("/")
}

const playerColor = game.color === "w" ? "white" : "black"
console.log("playerColor", playerColor)
const boardConfig: BoardConfig = {
  orientation: playerColor,
  premovable: { enabled: false },
  predroppable: { enabled: false },
  viewOnly: false,
}

const moveHistory = ref<string[]>(game.movesPlayed)

let boardApi: BoardApi | undefined

const playerCapturedPieces = ref<string[]>([])
const opponentCapturedPieces = ref<string[]>([])

const updatePlayerCapturedPieces = () => {
  if (!boardApi) return

  playerCapturedPieces.value =
    game.color === "w" ? boardApi.getCapturedPieces().white : boardApi.getCapturedPieces().black
}
const updateOpponentCapturedPieces = () => {
  if (!boardApi) return

  opponentCapturedPieces.value =
    game.color === "w" ? boardApi.getCapturedPieces().black : boardApi.getCapturedPieces().white
}

const onBoardCreated = (api: BoardApi) => {
  boardApi = api

  boardApi.loadPgn(game.pgn)

  updatePlayerCapturedPieces()
  updateOpponentCapturedPieces()
}

const isPlayersTurn = ref(playerColor === "white")
const opponentTimer = useTemplateRef("opponentTimer")
const playerTimer = useTemplateRef("playerTimer")

useAcknowledgeableEvent("PlayerMoved", (gameUpdate: GameUpdate) => {
  console.log("new move", gameUpdate)

  moveHistory.value.push(gameUpdate.san)

  if (boardApi?.getLastMove()?.san === gameUpdate.san) {
    playerTimer.value?.syncWithServer(gameUpdate.remainingTimeInMilliseconds)
    isPlayersTurn.value = false
    updatePlayerCapturedPieces()
    return
  }

  opponentTimer.value?.syncWithServer(gameUpdate.remainingTimeInMilliseconds)

  boardApi?.move(gameUpdate.san)
  isPlayersTurn.value = true

  updateOpponentCapturedPieces()
})

const secondsTillOpponentAutoResign = ref(-1)

useAcknowledgeableEvent("OpponentConnectionLost", (reconnectionTimeout) => {
  console.log("Opponent connection lost")
  secondsTillOpponentAutoResign.value = reconnectionTimeout / 1000
  const intervalId = setInterval(() => {
    if (secondsTillOpponentAutoResign.value <= -1) {
      clearInterval(intervalId)
      return
    }
    secondsTillOpponentAutoResign.value--
  }, 1000)
})

useAcknowledgeableEvent("OpponentReconnected", () => {
  console.log("Opponent reconnected")
  secondsTillOpponentAutoResign.value = -1
})

const resultModal = reactive({ isOpen: false, playerPOVResult: "", reason: "" })
const gameEnded = ref(false)

useAcknowledgeableEvent("GameEnded", (res: GameResult) => {
  console.log("game ended", res)
  gameEnded.value = true
  boardConfig.viewOnly = true
  if (res.wonSide) {
    const playerWon = res.wonSide === game.color
    resultModal.playerPOVResult = `You ${playerWon ? "won" : "lost"}`
    resultModal.reason = `by ${res.result === "Resigned" ? "resignation" : res.result}`
  } else {
    resultModal.playerPOVResult = "Draw"
    resultModal.reason = `by ${res.result}`
  }
  resultModal.isOpen = true
})

const onMove = async (move: any) => {
  console.log("onMove", move)

  // move came from server.
  if (move.color !== game.color) return

  await connectionStore.invoke("move", gameId, move.san)
  console.log("move invoked")
}

const playerTimedOut = () => {
  console.log("timed out ")
  // This actually stops as soon as the game times out.
  // Invoking timeout only once is not effective because we may do it a
  // fraction of a second earlier than the server sees the timeout.
  const intervalId = setInterval(async () => {
    try {
      if (await connectionStore.invoke("timeout", gameId)) {
        clearInterval(intervalId)
      }
    } catch {
      clearInterval(intervalId)
    }
  }, 1000)
}
</script>

<template>
  <section
    class="flex h-[calc(100vh-73px)] overflow-auto md:h-auto md:overflow-visible flex-col lg:flex-row justify-center w-full lg:max-w-[950px] mx-auto"
  >
    <section class="flex-1 flex flex-col justify-between content-between">
      <UCard id="opponentCard" class="my-2 mx-auto w-full max-w-full md:max-w-[700px]" :ui="{ body: 'sm:py-2' }">
        <div class="flex flex-row justify-between items-center">
          <div class="flex flex-row items-center">
            <span>{{ game.opponent }}</span>

            <span v-if="secondsTillOpponentAutoResign !== -1" class="text-xs ml-1">
              Disconnected, will auto-resign in {{ secondsTillOpponentAutoResign }}
            </span>
          </div>

          <div class="flex flex-row items-center">
            <ChessCapturedPieces :items="opponentCapturedPieces" :color="game.color === 'w' ? 'b' : 'w'" />

            <ChessTimer
              :run="!isPlayersTurn && !gameEnded"
              :duration="game.opponentRemainingTime"
              ref="opponentTimer"
              @timeout="playerTimedOut"
              class="mt-0.5"
            />
          </div>
        </div>
      </UCard>

      <TheChessboard
        :player-color="playerColor"
        :board-config="boardConfig"
        @move="onMove"
        @board-created="onBoardCreated"
        :reactive-config="true"
        ref="chessboard"
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
              <ChessCapturedPieces :items="playerCapturedPieces" :color="game.color" />

              <ChessTimer
                :run="isPlayersTurn && !gameEnded"
                :duration="game.playerRemainingTime"
                ref="playerTimer"
                @timeout="playerTimedOut"
                class="mt-0.5"
              />
            </div>
          </div>
        </UCard>

        <div class="lg:hidden mx-0 mt-2 bg-gray-100 dark:bg-gray-900">
          <ChessMobileMoveRecord :moves-played="moveHistory" class="max-w-[700px] mx-auto" />
        </div>
      </div>
    </section>

    <aside class="hidden lg:flex lg:flex-1/4 lg:flex-col lg:min-w-[200px] lg:max-w-[250px]">
      <ChessDesktopMoveRecord :movesPlayed="moveHistory" class="m-2 w-full" />
    </aside>
  </section>

  <UModal v-model:open="resultModal.isOpen">
    <template #content>
      <UCard>
        <h1 class="text-4xl text-center">{{ resultModal.playerPOVResult }}</h1>
        <h4 class="text-sm text-slate-300 text-center">{{ resultModal.reason }}</h4>

        <UButton to="/" block size="lg" class="m-3 ml-0">Back to lobby</UButton>
        <UButton
          @click="
            () => {
              resultModal.isOpen = false
            }
          "
          block
          size="lg"
          >See what happened</UButton
        >
      </UCard>
    </template>
  </UModal>
</template>
