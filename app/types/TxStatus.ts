import type { Hex } from "viem"

export type TxStatus = {
  isConfirming: boolean
  isConfirmed: boolean
  txId: Hex
  txErr: { message: string }
}
