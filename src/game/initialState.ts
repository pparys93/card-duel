import { cards } from "../data/cards";
import { drawHand } from "../utils/drawHand";
import { MAX_HP, STARTING_MANA, BOARD_SIZE } from "./constants";
import type { GameState } from "./types";

export function createInitialState(): GameState {
  return {
    turn: "player",
    player: { hp: MAX_HP, mana: STARTING_MANA },
    enemy: { hp: MAX_HP, mana: STARTING_MANA },
    playerBoard: Array(BOARD_SIZE).fill(undefined),
    enemyBoard: Array(BOARD_SIZE).fill(undefined),
    hand: drawHand(cards, STARTING_MANA),
    selectedInstanceId: null,
    hasDrawnThisTurn: false,
    enemyHasHadFirstTurn: false,
    gameEnded: false,
    winner: null,
  };
}
