import styles from "./GameControls.module.css";

interface GameControlsProps {
  drawCost: number;
  canDraw: boolean;
  canEndTurn: boolean;
  soundMuted: boolean;
  onDrawCard?: () => void;
  onEndTurn?: () => void;
  onToggleSound?: () => void;
}

function GameControls({
  drawCost,
  canDraw,
  canEndTurn,
  soundMuted,
  onDrawCard,
  onEndTurn,
  onToggleSound,
}: GameControlsProps) {
  return (
    <div className={styles.controls} role="group" aria-label="Game controls">
      <button
        type="button"
        className={styles.soundToggle}
        onClick={onToggleSound}
        aria-label="Mute sound effects"
        aria-pressed={soundMuted}
      >
        <svg className={styles.soundIcon} viewBox="0 0 24 24" aria-hidden="true">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          {soundMuted ? (
            <>
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </>
          ) : (
            <>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </>
          )}
        </svg>
      </button>
      <button
        type="button"
        className={`${styles.button} ${styles.draw}`}
        onClick={onDrawCard}
        disabled={!canDraw}
        aria-label={`Draw Card, costs ${drawCost} mana`}
      >
        <span className={styles.manaBadge} aria-hidden="true">
          {drawCost}
        </span>
        Draw Card
      </button>
      <button
        type="button"
        className={`${styles.button} ${styles.endTurn}`}
        onClick={onEndTurn}
        disabled={!canEndTurn}
      >
        End Turn
      </button>
    </div>
  );
}

export default GameControls;