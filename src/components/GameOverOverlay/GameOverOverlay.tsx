import styles from "./GameOverOverlay.module.css";

interface GameOverOverlayProps {
  visible: boolean;
  outcome: "victory" | "defeat" | null;
  onPlayAgain?: () => void;
}

const OUTCOME_CONTENT = {
  victory: {
    title: "Victory!",
    message: "Your spells proved superior. The enemy stands defeated.",
  },
  defeat: {
    title: "Defeated!",
    message: "Your defenses crumbled. The enemy stands victorious.",
  },
} as const;

function GameOverOverlay({ visible, outcome, onPlayAgain }: GameOverOverlayProps) {
  const overlayClassName = [styles.overlay, visible && styles.visible]
    .filter(Boolean)
    .join(" ");

  const content = outcome ? OUTCOME_CONTENT[outcome] : null;

  return (
    <div
      className={overlayClassName}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="game-over-title"
      aria-describedby="game-over-message"
    >
      {outcome === "victory" && (
        <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M14.5 17.5L3 6L3 3L6 3L17.5 14.5" />
          <path d="M13 19L19 13" />
          <path d="M16 16L20 20" />
          <path d="M19 21L21 19" />
          <path d="M14.5 6.5L18 3L21 3L21 6L17.5 9.5" />
          <path d="M5 14L9 18" />
          <path d="M7 17L4 20" />
          <path d="M3 19L5 21" />
        </svg>
      )}
      {outcome === "defeat" && (
        <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
          <path d="m12.5 17-.5-1-.5 1h1z" />
          <path d="M15 22a1 1 0 0 0 1-1v-1a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20v1a1 1 0 0 0 1 1z" />
          <circle cx="15" cy="12" r="1" />
          <circle cx="9" cy="12" r="1" />
        </svg>
      )}
      <p id="game-over-title" className={styles.title} role="heading" aria-level={2}>
        {content?.title}
      </p>
      <p id="game-over-message" className={styles.message}>
        {content?.message}
      </p>
      <button type="button" className={styles.button} onClick={onPlayAgain}>
        Play Again
      </button>
    </div>
  );
}

export default GameOverOverlay;
