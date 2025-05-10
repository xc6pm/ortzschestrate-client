<script setup lang="ts">
import { useRecentGamesStore } from "~/stores/recentGames"

const { recentGames } = storeToRefs(useRecentGamesStore())

const userStore = useUserStore()

const recentGamesToDisplay = computed(() =>
  recentGames.value.map((game) => {
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
)
</script>

<template>
  <UCard v-if="recentGames.length">
    <template #header>
      <h2 class="text-lg text-center">Recent Games</h2>
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

        <tr v-for="game in recentGamesToDisplay" :key="game.id">
          <td class="py-2">
            <div
              class="w-4 h-4 rounded-sm border-2 border-gray-400 dark:border-gray-600"
              :class="game.color === 'w' ? 'bg-white' : 'bg-black'"
            ></div>
          </td>

          <td class="py-2">
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
