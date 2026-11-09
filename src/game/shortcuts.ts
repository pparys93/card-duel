import { MAX_HAND_SIZE } from "./constants";
import type { GameAction } from "./reducer";
import type { GameState } from "./types";

// the one command that is not a game action: it changes a UI preference, not the game state
export type ShortcutCommand = GameAction | { type: "TOGGLE_SOUND" };

// the slice of KeyboardEvent this mapping needs, so tests can pass plain objects (no DOM)
export interface ShortcutKeyEvent {
  code: string;
  repeat: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
}

// digit1..digit<MAX_HAND_SIZE>: key N selects the Nth card in the hand
const HAND_KEY_CODES = Array.from({ length: MAX_HAND_SIZE }, (_, index) => `Digit${index + 1}`);

// returns the action a click would send; the rules (turn, mana, game over) stay in the reducer
export function getShortcutCommand(
  event: ShortcutKeyEvent,
  state: GameState,
): ShortcutCommand | null {
  // a held key would repeat the action; Ctrl/Meta/Alt combinations belong to the browser or OS
  if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return null;

  const handIndex = HAND_KEY_CODES.indexOf(event.code);
  if (handIndex !== -1) {
    const card = state.hand[handIndex];
    return card ? { type: "SELECT_CARD", instanceId: card.instanceId } : null;
  }

  switch (event.code) {
    case "KeyS": {
      // slots are interchangeable for the rules, so "the first free slot" loses nothing
      const slotIndex = state.playerBoard.findIndex((slot) => slot === undefined);
      return slotIndex === -1 ? null : { type: "PLACE_CARD", slotIndex };
    }
    case "KeyD":
      return { type: "DRAW_CARD" };
    case "KeyE":
      return { type: "END_PLAYER_TURN" };
    case "Escape":
      return { type: "DESELECT_CARD" };
    case "KeyM":
      return { type: "TOGGLE_SOUND" };
    default:
      return null;
  }
}
