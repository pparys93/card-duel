import { vi } from "vitest";
import type { CardData, HandCard } from "../types/card";
import type { GameState } from "../game/types";
import { BOARD_SIZE, MAX_HP } from "../game/constants";
import { deepFreeze } from "../utils/deepFreeze";

export function makeCard(overrides: Partial<CardData> = {}): CardData {
  return {
    id: "fireball",
    name: "Test card",
    description: "Test card.",
    mana: 2,
    stat: 3,
    type: "attack",
    ...overrides,
  };
}

export function makeHandCard(instanceId: string, overrides: Partial<CardData> = {}): HandCard {
  return { ...makeCard(overrides), instanceId };
}

export function emptyBoard(): (CardData | undefined)[] {
  return Array<CardData | undefined>(BOARD_SIZE).fill(undefined);
}

// builds a fully specified, deeply frozen state: tests never depend on createInitialState's
// random hand, and any accidental mutation inside the reducer throws instead of passing silently
export function makeState(overrides: Partial<GameState> = {}): GameState {
  return deepFreeze({
    gameId: 0,
    turn: "player",
    player: { hp: MAX_HP, mana: 5 },
    enemy: { hp: MAX_HP, mana: 5 },
    playerBoard: emptyBoard(),
    enemyBoard: emptyBoard(),
    hand: [],
    selectedInstanceId: null,
    hasDrawnThisTurn: false,
    enemyHasHadFirstTurn: false,
    gameEnded: false,
    winner: null,
    ...overrides,
  });
}

// small seedable PRNG (mulberry32): same seed, same sequence - keeps "random" tests reproducible
export function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// feeds Math.random a fixed sequence and fails loudly if the code under test asks for more
// values than the test planned for (a changed call order should break the test, not pass it)
export function mockRandom(...values: number[]) {
  const queue = [...values];
  return vi.spyOn(Math, "random").mockImplementation(() => {
    const next = queue.shift();
    if (next === undefined) {
      throw new Error("Math.random() was called more times than the test planned for");
    }
    return next;
  });
}

export function mockUuids(prefix = "uuid") {
  let counter = 0;
  return vi.spyOn(crypto, "randomUUID").mockImplementation(
    () => `${prefix}-${++counter}` as ReturnType<typeof crypto.randomUUID>,
  );
}
