<script setup lang="ts">
import type { FinishedGame } from "~/types/Game"

const recentGames = await $fetch<FinishedGame[]>(apiUrl("/history/games"), {
  method: "GET",
  params: { page: 1, count: 10 },
  credentials: "include",
})

const userStore = useUserStore()

const processedGames = recentGames.map((game) => {
  const opponent = game.players.find((p) => p.userId !== userStore.user?.id)
  const userIndex = game.players.findIndex((p) => p.userId === userStore.user?.id)
  const userColor = game.playerColors[userIndex]

  const result = game.wonSide === userColor ? "Win" : !game.wonSide ? "Draw" : "Loss"

  return {
    id: game.id,
    color: game.playerColors[userIndex],
    opponentName: opponent?.name || "Unknown",
    wagered: game.stakeEth > 0,
    result,
  }
})

const goToGame = async (gameId: string) => {
  await navigateTo(`/history/${gameId}`)
}
</script>

<template>
  <UCard v-if="recentGames.length">
    <template #header>
      <h2 class="text-lg text-center"><NuxtLink href="/history">Recent Games</NuxtLink></h2>
    </template>

    <table class="min-w-full table-auto border-collapse">
      <tbody>
        <tr>
          <!-- Set widths on first row only -->
          <td class="w-8"></td>
          <td></td>
          <td class="w-8"></td>
          <td class="w-8"></td>
        </tr>

        <tr v-for="game in processedGames" :key="game.id" @click="goToGame(game.id)" class="cursor-pointer group">
          <td class="py-2">
            <div
              class="w-4 h-4 rounded-sm border-2 border-gray-400 dark:border-gray-600"
              :class="game.color === 'w' ? 'bg-white' : 'bg-black'"
            ></div>
          </td>

          <td class="py-2 group-hover:underline">
            {{ game.opponentName }}
          </td>

          <td class="py-2 text-right">
            <span v-if="game.wagered">🪙</span>
          </td>

          <td class="py-2 text-right">
            <span
              class="inline-flex items-center justify-center w-5 h-5 rounded-sm text-sm font-bold text-white"
              :class="{
                'bg-primary-500': game.result === 'Win',
                'bg-red-600': game.result === 'Loss',
                'bg-gray-500': game.result === 'Draw',
              }"
            >
              <template v-if="game.result === 'Win'">＋</template>
              <template v-else-if="game.result === 'Loss'">－</template>
              <template v-else>＝</template>
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </UCard>
</template>
