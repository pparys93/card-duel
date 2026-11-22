import { describe, expect, it } from "vitest";
import { cards } from "../data/cards";
import { MAX_HAND_SIZE } from "./constants";
import { getShortcutCommand, type ShortcutKeyEvent } from "./shortcuts";
import { emptyBoard, makeHandCard, makeState } from "../test/helpers";

const first = makeHandCard("first", { mana: 1 });
const second = makeHandCard("second", { mana: 2 });
const third = makeHandCard("third", { mana: 3 });
const slotCard = cards[0];

// by default the key reports what a QWERTY keyboard would: KeyD -> "d", Digit1 -> "1"
const press = (code: string, overrides: Partial<ShortcutKeyEvent> = {}): ShortcutKeyEvent => ({
  code,
  key: code.startsWith("Key") ? code.slice(3).toLowerCase() : code.replace(/^Digit/, ""),
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

  describe("letters follow the printed letter, digits the physical key", () => {
    const state = makeState({ hand: [first] });

    it.each([
      ["a letter moved to another physical key (Dvorak, Colemak)", { code: "KeyH", key: "d" }, { type: "DRAW_CARD" }],
      ["the physical key now printing another shortcut letter", { code: "KeyD", key: "s" }, { type: "PLACE_CARD", slotIndex: 0 }],
      ["an uppercase letter (Shift, Caps Lock)", { code: "KeyH", key: "D" }, { type: "DRAW_CARD" }],
      ["a Cyrillic layout falls back to the physical key", { code: "KeyD", key: "в" }, { type: "DRAW_CARD" }],
      ["another Cyrillic key, same fallback", { code: "KeyM", key: "ь" }, { type: "TOGGLE_SOUND" }],
    ])("%s", (_label, keys, command) => {
      expect(getShortcutCommand(press(keys.code, { key: keys.key }), state)).toEqual(command);
    });

    it("ignores a physical shortcut key that prints another Latin letter", () => {
      expect(getShortcutCommand(press("KeyD", { key: "x" }), state)).toBeNull();
    });

    it.each([
      ["punctuation printed on a shortcut key (Dvorak '.')", { code: "KeyE", key: "." }],
      ["punctuation printed on a shortcut key (AZERTY ',')", { code: "KeyM", key: "," }],
      ["an accented Latin letter (AltGr ę, é)", { code: "KeyE", key: "ę" }],
      ["another accented Latin letter (AltGr ś)", { code: "KeyS", key: "ś" }],
      ["an IME composition key", { code: "KeyD", key: "Process" }],
      ["a dead key", { code: "KeyE", key: "Dead" }],
    ])("ignores %s", (_label, keys) => {
      expect(getShortcutCommand(press(keys.code, { key: keys.key }), state)).toBeNull();
    });

    it("selects cards by the physical digit key even when it prints a symbol (AZERTY)", () => {
      expect(getShortcutCommand(press("Digit1", { key: "&" }), state)).toEqual({
        type: "SELECT_CARD",
        instanceId: "first",
      });
    });
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
