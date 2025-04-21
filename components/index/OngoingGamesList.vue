<script setup lang="ts">
import type { OngoingGame } from "~/types/Game"

const ongoingShortGame = ref<OngoingGame | null>(null)

const connection = useConnectionStore()

ongoingShortGame.value = await connection.invoke("ongoingShortGame")

useConnectionEvent("GameStarted", async (gameId) => {
  ongoingShortGame.value = await connection.invoke("ongoingShortGame")
})

useConnectionEvent("GameEnded", async (gameResult) => {
  ongoingShortGame.value = await connection.invoke("ongoingShortGame")
})

const navigateToGame = () => {
  if (!ongoingShortGame.value) return
  navigateTo(`/game/${ongoingShortGame.value.id}`)
}
</script>

<template>
  <UCard v-if="ongoingShortGame">
    <template #header>
      <h2 class="text-lg text-center">Ongoing games</h2>
    </template>

    <div class="flex flex-row justify-between">
      <span>{{ ongoingShortGame.opponent }}</span>
      <UButton @click="navigateToGame">View</UButton>
    </div>
  </UCard>
</template>
