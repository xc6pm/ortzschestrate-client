<script setup lang="ts">
import type { FormError } from "@nuxt/ui"
import { useContractStateStore } from "~/stores/contractState.client"

const gameTimes = [
  { label: "Rapid", value: 600000 },
  { label: "Blitz", value: 300000 },
  { label: "Bullet", value: 180000 },
]
const colors = [
  { label: "White", value: "w" },
  { label: "Black", value: "b" },
]

const minStakeAmount = 0.0003
const newGame = reactive({ time: 600000, color: "w", wagered: false, stake: 0 })
const contractState = useContractStateStore()
watch(
  () => newGame.wagered,
  (newValue) => {
    if (!newValue) newGame.stake = 0
  }
)

const connectionStore = useConnectionStore()

const createGame = async () => {
  await connectionStore.invoke("create", newGame.time, newGame.color, newGame.stake)
  console.log("create invoked")
}

const validate = (state: Partial<{ wagered: boolean; stake: number }>): FormError<string>[] => {
  if (state.wagered) {
    if (state.stake! <= 0)
      return [{ name: "stake", message: "Must specify a stake amount greater than " + minStakeAmount }]
    else if (state.stake! > contractState.stakesEth)
      return [{ name: "stake", message: `Cannot specify that amount. You have ${contractState.stakesEth} POL.` }]
  } else if (state.stake! > 0) {
    return [{ name: "stake", message: "Can't specify stake when the game is non-wagered." }]
  }

  return []
}
</script>

<template>
  <UCard :ui="{ body: 'padding: p-3' }">
    <template #header>
      <h2 class="text-lg text-center">Setup a board</h2>
    </template>
    <UForm :state="newGame" @submit.prevent="createGame" :validate="validate">
      <UFormField label="Time:" name="time" class="my-3">
        <USelectMenu
          :items="gameTimes"
          v-model="newGame.time"
          value-key="value"
          placeholder="Time"
          required
          :search-input="false"
        />
      </UFormField>
      <UFormField label="Color:" name="color" class="my-3">
        <USelectMenu
          :items="colors"
          v-model="newGame.color"
          value-key="value"
          placeholder="Color"
          required
          :search-input="false"
        />
      </UFormField>

      <UFormField class="my-3" name="wagered" v-if="contractState.account.isConnected">
        <UCheckbox v-model="newGame.wagered" label="Wagered" />
      </UFormField>

      <UFormField label="Stake:" name="stake" class="my-3" v-if="contractState.account.isConnected && newGame.wagered">
        <UInput type="number" v-model="newGame.stake" />
      </UFormField>

      <UButton type="submit" class="mb-3" block>Create</UButton>
    </UForm>
  </UCard>
</template>
