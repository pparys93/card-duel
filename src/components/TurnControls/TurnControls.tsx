import styles from "./TurnControls.module.css";

interface TurnControlsProps {
  drawCost: number;
  canDraw: boolean;
  canEndTurn: boolean;
  onDrawCard?: () => void;
  onEndTurn?: () => void;
}

function TurnControls({
  drawCost,
  canDraw,
  canEndTurn,
  onDrawCard,
  onEndTurn,
}: TurnControlsProps) {
  return (
    <div
      className={styles.controls}
      role="toolbar"
      aria-label="Turn actions"
      aria-orientation="horizontal"
    >
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

export default TurnControls;
