import { useEffect, useRef, useState } from "react";
import { useReducer } from "react";
import { gameReducer, canDrawCard } from "./game/reducer";
import { createInitialState } from "./game/initialState";
import { DRAW_COST } from "./game/constants";
import RulesOverlay from "./components/RulesOverlay/RulesOverlay";
import ScreenGuard from "./components/ScreenGuard/ScreenGuard";
import GameOverOverlay from "./components/GameOverOverlay/GameOverOverlay";
import PlayerPanel from "./components/PlayerPanel/PlayerPanel";
import Board from "./components/Board/Board";
import TurnControls from "./components/TurnControls/TurnControls";
import Card from "./components/Card/Card";
import styles from "./App.module.css";

const RULES_SEEN_KEY = "cardDuelRulesSeen";

function App() {
  const [rulesVisible, setRulesVisible] = useState(
    () => !sessionStorage.getItem(RULES_SEEN_KEY),
  );
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState);
  const drawButtonRef = useRef<HTMLButtonElement>(null);

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
    setRulesVisible(false);
    sessionStorage.setItem(RULES_SEEN_KEY, "true");
    drawButtonRef.current?.focus();
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
        <h1 className={styles.visuallyHidden}>Card Duel</h1>

        <PlayerPanel
          variant="enemy"
          name="Enemy"
          hp={state.enemy.hp}
          mana={state.enemy.mana}
          cardCount={5}
          isActiveTurn={state.turn === "enemy"}
        />

        <Board variant="enemy" slots={state.enemyBoard} />

        <TurnControls
          ref={drawButtonRef}
          drawCost={DRAW_COST}
          canDraw={canDrawCard(state)}
          canEndTurn={state.turn === "player"}
          onDrawCard={() => dispatch({ type: "DRAW_CARD" })}
          onEndTurn={() => dispatch({ type: "END_PLAYER_TURN" })}
        />

        <Board
          variant="player"
          slots={state.playerBoard}
          onPlaceCard={(slotIndex) => dispatch({ type: "PLACE_CARD", slotIndex })}
        />

        <div className={styles.hand}>
          {state.hand.map((card) => (
            <Card
              key={card.instanceId}
              card={card}
              selected={state.selectedInstanceId === card.instanceId}
              affordable={card.mana <= state.player.mana}
              onSelect={() =>
                dispatch({ type: "SELECT_CARD", instanceId: card.instanceId })
              }
            />
          ))}
        </div>

        <PlayerPanel
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
