import { useEffect, useReducer, useState, useSyncExternalStore } from "react";
import { gameReducer, canDrawCard, allPlayerSlotsFull } from "./game/reducer";
import { createInitialState } from "./game/initialState";
import { DRAW_COST } from "./game/constants";
import { useSoundEffects } from "./hooks/useSoundEffects";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useInputMode } from "./hooks/useInputMode";
import {
  playSound,
  isSoundMuted,
  toggleSoundMuted,
  subscribeToSoundMuted,
} from "./utils/sounds";
import {
  isShortcutsEnabled,
  setShortcutsEnabled,
  subscribeToShortcutsEnabled,
} from "./utils/shortcutsPreference";
import RulesOverlay from "./components/RulesOverlay/RulesOverlay";
import ScreenGuard from "./components/ScreenGuard/ScreenGuard";
import GameOverOverlay from "./components/GameOverOverlay/GameOverOverlay";
import PlayerPanel from "./components/PlayerPanel/PlayerPanel";
import Board from "./components/Board/Board";
import GameControls from "./components/GameControls/GameControls";
import Hand from "./components/Hand/Hand";
import ShortcutsToggle from "./components/ShortcutsToggle/ShortcutsToggle";
import styles from "./App.module.css";

const RULES_SEEN_KEY = "cardDuelRulesSeen";

// sessionStorage throws when the browser blocks site data
function hasSeenRules(): boolean {
  try {
    return sessionStorage.getItem(RULES_SEEN_KEY) !== null;
  } catch {
    return false;
  }
}

function markRulesSeen(): void {
  try {
    sessionStorage.setItem(RULES_SEEN_KEY, "true");
  } catch {
    // rules show again next load
  }
}

function App() {
  const [rulesVisible, setRulesVisible] = useState(() => !hasSeenRules());
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState);
  const shortcutsEnabled = useSyncExternalStore(subscribeToShortcutsEnabled, isShortcutsEnabled);
  useSoundEffects(state);
  // inert doesn't block a document listener, so pause the shortcuts while the rules are open
  useKeyboardShortcuts(state, dispatch, !rulesVisible && shortcutsEnabled);
  useInputMode();

  const soundMuted = useSyncExternalStore(subscribeToSoundMuted, isSoundMuted);

  useEffect(() => {
    if (state.turn !== "enemy") return;

    let endTimeoutId: number;
    const playTimeoutId = window.setTimeout(() => {
      dispatch({ type: "PLAY_ENEMY_TURN" });
      endTimeoutId = window.setTimeout(() => {
        dispatch({ type: "END_ENEMY_TURN" });
      }, 1500);
    }, 0);

    return () => {
      clearTimeout(playTimeoutId);
      clearTimeout(endTimeoutId);
    };
  }, [state.turn]);

  const handleBeginDuel = () => {
    // rulesVisible lives outside the reducer, so useSoundEffects can't observe this
    // transition - the click sound is played directly from the handler instead
    playSound("buttonClick");
    setRulesVisible(false);
    markRulesSeen();
  };

  const outcome =
    state.winner === "player" ? "victory" : state.winner === "enemy" ? "defeat" : null;

  return (
    <>
      <RulesOverlay visible={rulesVisible} onBeginDuel={handleBeginDuel} />
      <ScreenGuard />
      <GameOverOverlay
        visible={state.gameEnded}
        outcome={outcome}
        onPlayAgain={() => dispatch({ type: "RESTART_GAME" })}
      />

      <main className={styles.game} inert={rulesVisible || state.gameEnded}>
        <ShortcutsToggle
          enabled={shortcutsEnabled}
          onToggle={() => setShortcutsEnabled(!shortcutsEnabled)}
        />

        <h1 className={styles.visuallyHidden}>Card Duel</h1>

        <PlayerPanel
          key={`enemy-${state.gameId}`}
          variant="enemy"
          name="Enemy"
          hp={state.enemy.hp}
          mana={state.enemy.mana}
          cardCount={5}
          isActiveTurn={state.turn === "enemy"}
        />

        <Board variant="enemy" slots={state.enemyBoard} />

        <GameControls
          drawCost={DRAW_COST}
          canDraw={canDrawCard(state)}
          canEndTurn={state.turn === "player"}
          soundMuted={soundMuted}
          shortcutsEnabled={shortcutsEnabled}
          onDrawCard={() => dispatch({ type: "DRAW_CARD" })}
          onEndTurn={() => dispatch({ type: "END_PLAYER_TURN" })}
          onToggleSound={toggleSoundMuted}
        />

        <Board
          variant="player"
          slots={state.playerBoard}
          highlightEmptySlots={state.selectedInstanceId !== null}
          onPlaceCard={(slotIndex) => dispatch({ type: "PLACE_CARD", slotIndex })}
        />

        <Hand
          cards={state.hand}
          selectedInstanceId={state.selectedInstanceId}
          playerMana={state.player.mana}
          canPlace={state.turn === "player" && !allPlayerSlotsFull(state)}
          shortcutsEnabled={shortcutsEnabled}
          onSelectCard={(instanceId) => dispatch({ type: "SELECT_CARD", instanceId })}
          onDropCard={(slotIndex) => dispatch({ type: "PLACE_CARD", slotIndex })}
        />

        <PlayerPanel
          key={`player-${state.gameId}`}
          variant="player"
          name="Player"
          hp={state.player.hp}
          mana={state.player.mana}
          isActiveTurn={state.turn === "player"}
        />
      </main>
    </>
  );
}

export default App;
