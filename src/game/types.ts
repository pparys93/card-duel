import type { CardData, HandCard } from "../types/card";

export type Turn = "player" | "enemy";

export interface CombatantState {
  hp: number;
  mana: number;
}

export interface GameState {
  turn: Turn;
  player: CombatantState;
  enemy: CombatantState;
  playerBoard: (CardData | undefined)[];
  enemyBoard: (CardData | undefined)[];
  hand: HandCard[];
  selectedInstanceId: string | null;
  hasDrawnThisTurn: boolean;
  enemyHasHadFirstTurn: boolean;
  gameEnded: boolean;
  winner: "player" | "enemy" | null;
}
