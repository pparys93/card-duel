import { useEffect, useRef } from "react";
import type { GameState } from "../game/types";
import { playSound } from "../utils/sounds";

export function useSoundEffects(state: GameState) {
  const previousRef = useRef(state);

  useEffect(() => {
    const previous = previousRef.current;
    previousRef.current = state;

    // RESTART_GAME jumps every field back to its initial value at once - without this
    // guard, that jump would look identical to a burst of draws/damage/etc. and fire
    // every sound below spuriously; the original never faced this, since "Play Again"
    // did a full page reload instead of resetting state in place
    const isRestart = previous.gameEnded && !state.gameEnded;
    if (isRestart) return;

    if (state.hand.length > previous.hand.length) {
      playSound("cardDraw");
    }

    if (state.selectedInstanceId !== null && state.selectedInstanceId !== previous.selectedInstanceId) {
      playSound("cardSelect");
    }

    const playerCardCount = state.playerBoard.filter(Boolean).length;
    const previousPlayerCardCount = previous.playerBoard.filter(Boolean).length;
    if (playerCardCount > previousPlayerCardCount) {
      playSound("cardPlace");
    }

    if (state.player.hp !== previous.player.hp || state.enemy.hp !== previous.enemy.hp) {
      playSound("spellEffect");
    }

    if (previous.turn === "player" && state.turn === "enemy") {
      playSound("buttonClick");
    }

    if (!previous.gameEnded && state.gameEnded) {
      playSound("gameOver");
    }
  }, [state]);
}
