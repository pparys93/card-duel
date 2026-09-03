import type { GameState } from "./types";
import { pickRandom } from "../utils/pickRandom";
import { cards } from "../data/cards";
import {
  DRAW_COST,
  MAX_HAND_SIZE,
  MAX_HP,
  MAX_MANA,
  MANA_INCREMENT,
  ENEMY_SKIP_CHANCE,
  ENEMY_MAX_CARDS_PER_TURN,
} from "./constants";
import type { HandCard } from "../types/card";
import { createInitialState } from "./initialState";

export type GameAction =
  | { type: "SELECT_CARD"; instanceId: string }
  | { type: "DESELECT_CARD" }
  | { type: "DRAW_CARD" }
  | { type: "PLACE_CARD"; slotIndex: number }
  | { type: "END_PLAYER_TURN" }
  | { type: "PLAY_ENEMY_TURN" }
  | { type: "END_ENEMY_TURN" }
  | { type: "RESTART_GAME" };

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

function growMana(mana: number): number {
  return Math.min(mana + MANA_INCREMENT, MAX_MANA);
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

      const drawn = pickRandom(cards);
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

    case "END_PLAYER_TURN": {
      if (state.turn !== "player") return state;

      // player skips mana growth on turn 1 (starts at STARTING_MANA); enemy mirrors
      // that here so both sides reach the same mana on their own turn N
      const nextEnemy = state.enemyHasHadFirstTurn
        ? { ...state.enemy, mana: growMana(state.enemy.mana) }
        : state.enemy;

      return {
        ...state,
        turn: "enemy",
        enemy: nextEnemy,
        enemyHasHadFirstTurn: true,
        selectedInstanceId: null,
      };
    }

    case "PLAY_ENEMY_TURN": {
      if (state.turn !== "enemy" || state.gameEnded) return state;
      if (Math.random() < ENEMY_SKIP_CHANCE) return state; // enemy skips this turn

      const attackCards = cards.filter((c) => c.type === "attack");
      const nextEnemyBoard = [...state.enemyBoard];
      let enemyMana = state.enemy.mana;
      let playerHp = state.player.hp;
      let cardsPlayed = 0;

      while (cardsPlayed < ENEMY_MAX_CARDS_PER_TURN) {
        const emptySlotIndices = nextEnemyBoard
          .map((slot, index) => (slot === undefined ? index : -1))
          .filter((index) => index !== -1);
        if (emptySlotIndices.length === 0) break; // no free slots

        const card = pickRandom(attackCards);
        if (enemyMana < card.mana) break; // can't afford any card - end turn early

        const slotIndex = pickRandom(emptySlotIndices);
        nextEnemyBoard[slotIndex] = card;

        enemyMana -= card.mana;
        playerHp = Math.max(playerHp - card.stat, 0);
        cardsPlayed++;

        if (playerHp <= 0) break; // stop playing further cards once someone has won
      }

      return {
        ...state,
        enemyBoard: nextEnemyBoard,
        enemy: { ...state.enemy, mana: enemyMana },
        player: { ...state.player, hp: playerHp },
        gameEnded: playerHp <= 0,
        winner: playerHp <= 0 ? "enemy" : state.winner,
      };
    }

    case "END_ENEMY_TURN": {
      if (state.turn !== "enemy" || state.gameEnded) return state;

      return {
        ...state,
        turn: "player",
        playerBoard: Array(state.playerBoard.length).fill(undefined),
        enemyBoard: Array(state.enemyBoard.length).fill(undefined),
        hasDrawnThisTurn: false,
        player: { ...state.player, mana: growMana(state.player.mana) },
      };
    }

    case "RESTART_GAME": {
      if (!state.gameEnded) return state;
      return createInitialState();
    }

    default:
      return state;
  }
}
