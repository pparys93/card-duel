import { useEffect, useEffectEvent } from "react";
import type { Dispatch } from "react";
import type { GameAction } from "../game/reducer";
import { getShortcutCommand } from "../game/shortcuts";
import type { GameState } from "../game/types";
import { isScreenGuardActive } from "../utils/screenGuard";
import { toggleSoundMuted } from "../utils/sounds";

export function useKeyboardShortcuts(
  state: GameState,
  dispatch: Dispatch<GameAction>,
  enabled: boolean,
) {
  // effect event: always sees the latest state, so the listener isn't re-registered after every action
  const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (isScreenGuardActive()) return;
    const command = getShortcutCommand(event, state);
    if (command === null) return;

    if (command.type === "TOGGLE_SOUND") toggleSoundMuted();
    else dispatch(command);
  });

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [enabled]);
}
