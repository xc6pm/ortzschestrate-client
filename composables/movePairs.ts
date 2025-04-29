import { computed } from "vue"

export interface MovePair {
  white: string
  black: string
}

export function useMovePairs(moves: string[]) {
  const movePairs = computed<MovePair[]>(() => {
    const pairs: MovePair[] = []

    for (let i = 0; i < moves.length; i += 2) {
      pairs.push({
        white: moves[i] || "",
        black: moves[i + 1] || "",
      })
    }

    return pairs
  })

  return { movePairs }
}
