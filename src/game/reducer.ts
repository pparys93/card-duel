import type { GameState } from "./types";
import { pickRandomCard } from "../utils/pickRandomCard";
import { cards } from "../data/cards";
import { DRAW_COST, MAX_HAND_SIZE } from "./constants";
import type { HandCard } from "../types/card";

export type GameAction =
  | { type: "SELECT_CARD"; instanceId: string }
  | { type: "DESELECT_CARD" }
  | { type: "DRAW_CARD" };

export function canDrawCard(state: GameState): boolean {
  return (
    state.turn === "player" &&
    !state.hasDrawnThisTurn &&
    state.hand.length < MAX_HAND_SIZE &&
    state.player.mana >= DRAW_COST
  );
}

function allPlayerSlotsFull(state: GameState): boolean {
  return state.playerBoard.every((slot) => slot !== undefined);
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "SELECT_CARD": {
      if (state.turn !== "player") return state;

      // clicking the already-selected card again acts as a toggle: deselect it
      if (state.selectedInstanceId === action.instanceId) {
        return { ...state, selectedInstanceId: null };
      }

      const card = state.hand.find((c) => c.instanceId === action.instanceId);
      if (!card) return state;

      // can't select a card with nowhere to place it, or one the player can't afford
      if (allPlayerSlotsFull(state) || card.mana > state.player.mana) {
        return state;
      }

      return { ...state, selectedInstanceId: action.instanceId };
    }

    case "DESELECT_CARD": {
      if (!state.selectedInstanceId) return state;
      return { ...state, selectedInstanceId: null };
    }

    case "DRAW_CARD": {
      if (!canDrawCard(state)) return state;

      const drawn = pickRandomCard(cards);
      const newCard: HandCard = { ...drawn, instanceId: crypto.randomUUID() };

      return {
        ...state,
        hand: [...state.hand, newCard],
        player: { ...state.player, mana: state.player.mana - DRAW_COST },
        hasDrawnThisTurn: true,
      };
    }

    default:
      return state;
  }
}
