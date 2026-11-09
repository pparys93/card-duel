import { describe, expect, it } from "vitest";
import { cards } from "../data/cards";
import { MAX_HAND_SIZE } from "./constants";
import { getShortcutCommand, type ShortcutKeyEvent } from "./shortcuts";
import { emptyBoard, makeHandCard, makeState } from "../test/helpers";

const first = makeHandCard("first", { mana: 1 });
const second = makeHandCard("second", { mana: 2 });
const third = makeHandCard("third", { mana: 3 });
const slotCard = cards[0];

const press = (code: string, overrides: Partial<ShortcutKeyEvent> = {}): ShortcutKeyEvent => ({
  code,
  repeat: false,
  ctrlKey: false,
  metaKey: false,
  altKey: false,
  ...overrides,
});

describe("getShortcutCommand", () => {
  describe("digit keys (select a card by its position in the hand)", () => {
    const state = makeState({ hand: [first, second, third] });

    it.each([
      ["Digit1", "first"],
      ["Digit2", "second"],
      ["Digit3", "third"],
    ])("%s selects the card at that position", (code, instanceId) => {
      expect(getShortcutCommand(press(code), state)).toEqual({ type: "SELECT_CARD", instanceId });
    });

    it("returns nothing for a position past the end of the hand", () => {
      expect(getShortcutCommand(press("Digit4"), state)).toBeNull();
    });

    it("covers exactly MAX_HAND_SIZE positions", () => {
      const fullHand = Array.from({ length: MAX_HAND_SIZE }, (_, i) => makeHandCard(`card-${i}`));
      const full = makeState({ hand: fullHand });
      const last = `Digit${MAX_HAND_SIZE}`;
      expect(getShortcutCommand(press(last), full)).toEqual({
        type: "SELECT_CARD",
        instanceId: `card-${MAX_HAND_SIZE - 1}`,
      });
      expect(getShortcutCommand(press(`Digit${MAX_HAND_SIZE + 1}`), full)).toBeNull();
    });
  });

  describe("S (play the selected card in the first free slot)", () => {
    it("targets slot 0 on an empty board", () => {
      expect(getShortcutCommand(press("KeyS"), makeState())).toEqual({ type: "PLACE_CARD", slotIndex: 0 });
    });

    it("skips occupied slots", () => {
      const board = emptyBoard();
      board[0] = slotCard;
      board[1] = slotCard;
      expect(getShortcutCommand(press("KeyS"), makeState({ playerBoard: board }))).toEqual({
        type: "PLACE_CARD",
        slotIndex: 2,
      });
    });

    it("finds a free slot that comes after an occupied one", () => {
      const board = emptyBoard().map((_, i) => (i === 2 ? undefined : slotCard));
      expect(getShortcutCommand(press("KeyS"), makeState({ playerBoard: board }))).toEqual({
        type: "PLACE_CARD",
        slotIndex: 2,
      });
    });

    it("returns nothing when every slot is taken (there is no valid index to send)", () => {
      const board = emptyBoard().map(() => slotCard);
      expect(getShortcutCommand(press("KeyS"), makeState({ playerBoard: board }))).toBeNull();
    });
  });

  it.each([
    ["KeyD", { type: "DRAW_CARD" }],
    ["KeyE", { type: "END_PLAYER_TURN" }],
    ["Escape", { type: "DESELECT_CARD" }],
    ["KeyM", { type: "TOGGLE_SOUND" }],
  ])("%s maps to %j", (code, command) => {
    expect(getShortcutCommand(press(code), makeState())).toEqual(command);
  });

  it("leaves the rules to the reducer: returns the action even when it will be rejected", () => {
    // enemy's turn and a game that has ended: a click would send the same action
    const state = makeState({ turn: "enemy", gameEnded: true, winner: "player" });
    expect(getShortcutCommand(press("KeyD"), state)).toEqual({ type: "DRAW_CARD" });
    expect(getShortcutCommand(press("KeyE"), state)).toEqual({ type: "END_PLAYER_TURN" });
  });

  it("ignores keys that have no shortcut", () => {
    expect(getShortcutCommand(press("KeyX"), makeState())).toBeNull();
    expect(getShortcutCommand(press("Enter"), makeState())).toBeNull();
    expect(getShortcutCommand(press("Space"), makeState())).toBeNull();
  });

  it("ignores a held key (repeat)", () => {
    expect(getShortcutCommand(press("KeyD", { repeat: true }), makeState())).toBeNull();
  });

  it.each(["ctrlKey", "metaKey", "altKey"] as const)(
    "ignores the key when %s is held (browser and OS shortcuts keep priority)",
    (modifier) => {
      expect(getShortcutCommand(press("KeyD", { [modifier]: true }), makeState())).toBeNull();
    },
  );
});
