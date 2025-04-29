<script setup lang="ts">
const props = defineProps<{
  movesPlayed: string[]
}>()

const { movePairs } = useMovePairs(props.movesPlayed)


const bottomMarker = useTemplateRef("bottomMarker")

watch(movePairs, async () => {
  await nextTick()
  bottomMarker.value?.scrollIntoView({ behavior: 'smooth', inline: 'end' })
})
</script>

<template>
  <div class="px-4 pt-2 overflow-x-auto whitespace-nowrap">
    <div class="inline-flex text-sm leading-relaxed ">
      <template v-for="(pair, index) in movePairs" :key="index">
        <div class="flex items-center mr-4 mb-2">
          <span class="font-semibold">{{ index + 1 }}.</span>&nbsp; <span class="bg-gray-300 dark:bg-gray-400 px-1 rounded">{{ pair.white }}</span
          >&nbsp;
          <span class="bg-gray-500 dark:bg-gray-600 text-slate-100 px-1 rounded">{{ pair.black }}</span>
        </div>
      </template>

      <!-- Invisible marker to scroll to -->
      <div ref="bottomMarker"></div>
    </div>
  </div>
</template>
