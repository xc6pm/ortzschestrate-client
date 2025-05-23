export type Player = { userId: string; name: string }
export type TimeControl = { name: string; value: number }
export type PieceColor = { asChar: string; name: string; value: number }
export type PendingGame = {
  creator: Player
  timeControl: TimeControl
  creatorColor: PieceColor
}

export type OngoingGame = {
  id: string
  color: string
  opponent: string
  timeInMilliseconds: number
  playerRemainingTime: number
  opponentRemainingTime: number
  stakeEth: number
  pgn: string
  movesPlayed: string[]
}

export type GameEnding =
  | "Checkmate"
  | "Resigned"
  | "Timeout"
  | "Stalemate"
  | "DrawDeclared"
  | "InsufficientMaterial"
  | "FiftyMoveRule"
  | "Repetition"

export type GameResult = {
  result: GameEnding
  wonSide?: "w" | "b"
}

export type GameUpdate = {
  san: string
  remainingTimeInMilliseconds: number
}

export type FinishedGame = {
  id: string
  players: Player[]
  playerColors: string[]
  stakeEth: number
  timeControl: TimeControl
  started: Date
  remainingTimesInMs: number[]
  pgn: string
  endgameType: string
  wonSide: string
}

export type FinishedGameSlim = {
  id: string
  players: Player[]
  playerColors: string[]
  stakeEth: number
  timeControl: TimeControl
  started: Date
  wonSide: string
}

export type AckMessage = {
  messageId: number
  message: any
}
