<script setup lang="ts">
const props = defineProps<{ items: string[], color: string }>()

const getClassForCapturedPiece = (char: string, color: string) => {
  let pieceClass = color === "w" ? "white " : "black "

  switch (char) {
    case "p":
      return pieceClass + "pawn"
    case "r":
      return pieceClass + "rook"
    case "n":
      return pieceClass + "knight"
    case "b":
      return pieceClass + "bishop"
    case "q":
      return pieceClass + "queen"
    case "k":
      return pieceClass + "king"
    default:
      break
  }
  return ""
}

const classes = computed(() => {
  return props.items.map((piece) => getClassForCapturedPiece(piece, props.color))
})
</script>
<template>
  <div class="mt-1 flex flex-row mb-1 mr-2 gap-1 overflow-x-auto whitespace-nowrap">
    <piece
      v-for="(piece, index) in classes"
      :key="index"
      alt="captured"
      class="relative text-base mx-auto"
      :class="piece"
    />
  </div>
</template>

<style scoped>
piece {
  position: relative;
  width: 1.2rem;
  height: 1.2rem;
}
</style>
