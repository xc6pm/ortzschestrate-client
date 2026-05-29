import type { Hex } from "viem"

export const shortenHex = (hex: Hex | undefined, first: number, last: number) =>
  hex && hex.length ? `${hex.substring(0, first)}...${hex.substring(hex.length - last, hex.length)}` : ""