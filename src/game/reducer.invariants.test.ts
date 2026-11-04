import { describe, expect, it, vi } from "vitest";
import { deepFreeze } from "../utils/deepFreeze";
import { BOARD_SIZE, MAX_HAND_SIZE, MAX_HP, MAX_MANA } from "./constants";
import { createInitialState } from "./initialState";
import { gameReducer, type GameAction } from "./reducer";
import type { GameState } from "./types";
import { mulberry32 } from "../test/helpers";

// Property-style check on the REAL card data: play thousands of random (and often invalid)
// actions from a seeded generator and assert rules that must hold after every single step.
// Unlike reducer.test.ts, nothing here is tied to concrete card numbers.

const GAMES = 100;
const MAX_STEPS = 500;

function randomAction(state: GameState, rng: () => number): GameAction {
  const roll = rng();
  if (state.turn === "player") {
    if (roll < 0.3) {
      // sometimes a real card, sometimes an id that doesn't exist
      const card = state.hand[Math.floor(rng() * (state.hand.length + 1))];
      return { type: "SELECT_CARD", instanceId: card?.instanceId ?? "ghost" };
    }
    if (roll < 0.6) {
      // -1 .. BOARD_SIZE: includes out-of-range indexes
      return { type: "PLACE_CARD", slotIndex: Math.floor(rng() * (BOARD_SIZE + 2)) - 1 };
    }
    if (roll < 0.75) return { type: "DRAW_CARD" };
    if (roll < 0.8) return { type: "DESELECT_CARD" };
    return { type: "END_PLAYER_TURN" };
  }
  // enemy turn: the app dispatches these two in order, but out-of-order calls must be harmless too
  return roll < 0.5 ? { type: "PLAY_ENEMY_TURN" } : { type: "END_ENEMY_TURN" };
}

function assertStateInvariants(state: GameState, label: string) {
  const selected = state.hand.find((card) => card.instanceId === state.selectedInstanceId);
  if (state.selectedInstanceId !== null) {
    expect(selected, `${label}: selected card must be in hand`).toBeDefined();
    expect(selected!.mana, `${label}: selected card must be affordable`).toBeLessThanOrEqual(
      state.player.mana,
    );
  }

  expect(state.hand.length, `${label}: hand size`).toBeLessThanOrEqual(MAX_HAND_SIZE);
  expect(new Set(state.hand.map((c) => c.instanceId)).size, `${label}: unique instanceIds`).toBe(
    state.hand.length,
  );

  for (const side of [state.player, state.enemy]) {
    expect(side.hp, `${label}: hp range`).toBeGreaterThanOrEqual(0);
    expect(side.hp, `${label}: hp range`).toBeLessThanOrEqual(MAX_HP);
    expect(side.mana, `${label}: mana range`).toBeGreaterThanOrEqual(0);
    expect(side.mana, `${label}: mana range`).toBeLessThanOrEqual(MAX_MANA);
  }

  expect(state.playerBoard, `${label}: player board size`).toHaveLength(BOARD_SIZE);
  expect(state.enemyBoard, `${label}: enemy board size`).toHaveLength(BOARD_SIZE);
  for (const card of state.enemyBoard) {
    if (card) expect(card.type, `${label}: enemy only plays attack cards`).toBe("attack");
  }

  expect(state.gameEnded, `${label}: gameEnded <=> winner`).toBe(state.winner !== null);
  if (state.winner === "player") expect(state.enemy.hp, `${label}: player win`).toBe(0);
  if (state.winner === "enemy") expect(state.player.hp, `${label}: enemy win`).toBe(0);
  if (!state.gameEnded) {
    expect(state.player.hp, `${label}: alive`).toBeGreaterThan(0);
    expect(state.enemy.hp, `${label}: alive`).toBeGreaterThan(0);
  }
}

function assertTransitionInvariants(before: GameState, after: GameState, action: GameAction, label: string) {
  // resources only move through the actions that are meant to move them
  if (action.type !== "END_ENEMY_TURN") {
    expect(after.player.mana, `${label}: player mana never grows outside END_ENEMY_TURN`).toBeLessThanOrEqual(
      before.player.mana,
    );
  }
  if (action.type !== "END_PLAYER_TURN") {
    expect(after.enemy.mana, `${label}: enemy mana never grows outside END_PLAYER_TURN`).toBeLessThanOrEqual(
      before.enemy.mana,
    );
  }
  if (action.type !== "PLACE_CARD") {
    expect(after.player.hp, `${label}: player HP only rises via a heal card`).toBeLessThanOrEqual(before.player.hp);
  }
  expect(after.enemy.hp, `${label}: enemy HP never rises`).toBeLessThanOrEqual(before.enemy.hp);

  // the turn only flips through the two turn-ending actions
  if (action.type !== "END_PLAYER_TURN" && action.type !== "END_ENEMY_TURN") {
    expect(after.turn, `${label}: turn unchanged by ${action.type}`).toBe(before.turn);
  }
  expect(after.gameId, `${label}: gameId only changes on restart`).toBe(before.gameId);
}

describe("reducer invariants under seeded random play (real card data)", () => {
  // loops over many games: an explicit timeout keeps slow runners
  // from tripping the default 5 s limit
  it(`holds after every action across ${GAMES} games`, { timeout: 30_000 }, () => {
    let finishedGames = 0;
    let steps = 0;
    let stepsWithEnemyCards = 0;

    for (let seed = 1; seed <= GAMES; seed++) {
      const rng = mulberry32(seed);
      vi.spyOn(Math, "random").mockImplementation(rng);

      let state = deepFreeze(createInitialState());
      assertStateInvariants(state, `seed ${seed} start`);

      for (let step = 0; step < MAX_STEPS && !state.gameEnded; step++) {
        const action = randomAction(state, rng);
        const label = `seed ${seed}, step ${step}, ${action.type}`;
        const before = state;

        // frozen input: a reducer that mutates its previous state throws a TypeError here
        state = deepFreeze(gameReducer(before, action));
        steps++;

        assertStateInvariants(state, label);
        assertTransitionInvariants(before, state, action, label);
        if (state.enemyBoard.some(Boolean)) stepsWithEnemyCards++;
      }
      if (state.gameEnded) finishedGames++;
    }

    // sanity: the run really reached end conditions instead of idling on rejected actions...
    expect(finishedGames).toBeGreaterThan(0);
    expect(steps).toBeGreaterThan(GAMES * 10);
    // ...and the enemy really played cards, otherwise "enemy only plays attack cards" passes vacuously
    expect(stepsWithEnemyCards).toBeGreaterThan(0);
  });
});
