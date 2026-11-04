import { describe, expect, it, vi } from "vitest";
import { MAX_HAND_SIZE } from "../game/constants";
import { makeCard, mulberry32 } from "../test/helpers";
import { drawHand } from "./drawHand";

// Math.random() just below 1 makes every Fisher-Yates swap pick j === i, so the "shuffle"
// leaves the deck order unchanged and the dealt hand is simply the first `count` cards
const NO_SHUFFLE = 0.999999;
const deck = (...manaCosts: number[]) =>
  manaCosts.map((mana, index) => makeCard({ name: `card-${index}`, mana }));

describe("drawHand", () => {
  it("deals `count` cards, each with its own instanceId", () => {
    vi.spyOn(Math, "random").mockImplementation(mulberry32(7));
    const hand = drawHand(deck(1, 2, 3, 4, 5, 6, 7), 10, 5);
    expect(hand).toHaveLength(5);
    expect(new Set(hand.map((card) => card.instanceId)).size).toBe(5);
  });

  it("defaults to MAX_HAND_SIZE cards", () => {
    vi.spyOn(Math, "random").mockImplementation(mulberry32(7));
    expect(drawHand(deck(1, 2, 3, 4, 5, 6, 7), 10)).toHaveLength(MAX_HAND_SIZE);
  });

  it("leaves the hand alone when it already holds an affordable card", () => {
    vi.spyOn(Math, "random").mockReturnValue(NO_SHUFFLE);
    const hand = drawHand(deck(5, 3, 1, 4, 6, 1), 1, 5);
    expect(hand.map((card) => card.mana)).toEqual([5, 3, 1, 4, 6]);
  });

  it("swaps the hand's most expensive card for an affordable leftover when nothing is playable", () => {
    vi.spyOn(Math, "random").mockReturnValue(NO_SHUFFLE);
    // hand = [5, 3, 6, 2, 4], none affordable with 1 mana; leftovers = [7, 1]
    const hand = drawHand(deck(5, 3, 6, 2, 4, 7, 1), 1, 5);
    expect(hand.map((card) => card.mana)).toEqual([5, 3, 1, 2, 4]); // the 6 was replaced by the 1
  });

  it("takes the first affordable leftover when several qualify", () => {
    vi.spyOn(Math, "random").mockReturnValue(NO_SHUFFLE);
    // hand = [5, 3, 6, 2, 4], none affordable with 1 mana; both leftovers (card-5, card-6) cost 1
    const hand = drawHand(deck(5, 3, 6, 2, 4, 1, 1), 1, 5);
    expect(hand.map((card) => card.name)).toEqual(["card-0", "card-1", "card-5", "card-3", "card-4"]);
  });

  it("keeps the hand as dealt when no leftover card is affordable either", () => {
    vi.spyOn(Math, "random").mockReturnValue(NO_SHUFFLE);
    const hand = drawHand(deck(5, 3, 6, 2, 4, 7, 8), 1, 5);
    expect(hand.map((card) => card.mana)).toEqual([5, 3, 6, 2, 4]);
  });

  it("actually shuffles: different seeds deal different hands", () => {
    const pool = deck(1, 1, 1, 1, 1, 1, 1, 1, 1, 1); // every card is playable, so the guarantee never reorders the hand
    const hands = new Set<string>();
    for (const seed of [1, 2, 3, 4, 5]) {
      vi.spyOn(Math, "random").mockImplementation(mulberry32(seed));
      hands.add(drawHand(pool, 1, 5).map((card) => card.name).join(","));
    }
    expect(hands.size).toBeGreaterThan(1);
  });

  it("does not modify the deck it was given", () => {
    vi.spyOn(Math, "random").mockImplementation(mulberry32(3));
    const source = deck(1, 2, 3, 4, 5, 6);
    const snapshot = source.map((card) => card.name);
    drawHand(source, 1, 5);
    expect(source.map((card) => card.name)).toEqual(snapshot);
  });
});
