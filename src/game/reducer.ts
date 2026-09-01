import type { GameState } from "./types";
import { pickRandomCard } from "../utils/pickRandomCard";
import { cards } from "../data/cards";
import { DRAW_COST, MAX_HAND_SIZE, MAX_HP } from "./constants";
import type { HandCard } from "../types/card";

export type GameAction =
  | { type: "SELECT_CARD"; instanceId: string }
  | { type: "DESELECT_CARD" }
  | { type: "DRAW_CARD" }
  | { type: "PLACE_CARD"; slotIndex: number };

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

    case "PLACE_CARD": {
      if (state.turn !== "player" || state.gameEnded) return state;
      if (!state.selectedInstanceId) return state;
      // out-of-bounds slot index shouldn't happen from real UI, but guard anyway -
      // type safety alone doesn't stop a bad runtime value from slipping through
      if (action.slotIndex < 0 || action.slotIndex >= state.playerBoard.length) {
        return state;
      }
      if (state.playerBoard[action.slotIndex] !== undefined) return state;

      const card = state.hand.find((c) => c.instanceId === state.selectedInstanceId);
      if (!card || card.mana > state.player.mana) return state;

      const nextPlayerBoard = [...state.playerBoard];
      nextPlayerBoard[action.slotIndex] = card;

      const nextHand = state.hand.filter((c) => c.instanceId !== card.instanceId);

      let nextPlayer = { ...state.player, mana: state.player.mana - card.mana };
      let nextEnemy = state.enemy;

      if (card.type === "attack") {
        nextEnemy = { ...state.enemy, hp: Math.max(state.enemy.hp - card.stat, 0) };
      } else {
        nextPlayer = { ...nextPlayer, hp: Math.min(nextPlayer.hp + card.stat, MAX_HP) };
      }

      const winner =
        nextEnemy.hp <= 0 ? "player" : nextPlayer.hp <= 0 ? "enemy" : null;

      return {
        ...state,
        player: nextPlayer,
        enemy: nextEnemy,
        playerBoard: nextPlayerBoard,
        hand: nextHand,
        selectedInstanceId: null,
        gameEnded: winner !== null,
        winner,
      };
    }

    default:
      return state;
  }
}
