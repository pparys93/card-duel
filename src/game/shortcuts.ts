import { MAX_HAND_SIZE } from "./constants";
import type { GameAction } from "./reducer";
import type { GameState } from "./types";

// the one command that is not a game action: it changes a UI preference, not the game state
export type ShortcutCommand = GameAction | { type: "TOGGLE_SOUND" };

// the slice of KeyboardEvent this mapping needs, so tests can pass plain objects (no DOM)
export interface ShortcutKeyEvent {
  code: string;
  key: string;
  repeat: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
}

// digit1..digit<MAX_HAND_SIZE>: key N selects the Nth card in the hand
const HAND_KEY_CODES = Array.from({ length: MAX_HAND_SIZE }, (_, index) => `Digit${index + 1}`);

// letters follow the printed character (Dvorak, AZERTY); only a non-Latin letter (Cyrillic, Greek, ...)
// falls back to the physical key, so punctuation, accented letters and dead/IME keys never trigger a shortcut
function getLetter(event: ShortcutKeyEvent): string | null {
  if (/^\p{Script=Latin}$/u.test(event.key)) return event.key.toLowerCase();
  if (!/^\p{L}$/u.test(event.key)) return null;
  const physical = /^Key([A-Z])$/.exec(event.code);
  return physical ? physical[1].toLowerCase() : null;
}

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

  if (event.code === "Escape") return { type: "DESELECT_CARD" };

  switch (getLetter(event)) {
    case "s": {
      // slots are interchangeable for the rules, so "the first free slot" loses nothing
      const slotIndex = state.playerBoard.findIndex((slot) => slot === undefined);
      return slotIndex === -1 ? null : { type: "PLACE_CARD", slotIndex };
    }
    case "d":
      return { type: "DRAW_CARD" };
    case "e":
      return { type: "END_PLAYER_TURN" };
    case "m":
      return { type: "TOGGLE_SOUND" };
    default:
      return null;
  }
}