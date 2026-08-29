import styles from "./RulesOverlay.module.css";

interface RulesOverlayProps {
  visible: boolean;
  onBeginDuel?: () => void;
}

function RulesOverlay({ visible, onBeginDuel }: RulesOverlayProps) {
  const overlayClassName = [styles.overlay, visible && styles.visible]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={overlayClassName}
      role="dialog"
      aria-modal="true"
      aria-labelledby="rules-overlay-title"
      aria-describedby="rules-overlay-message"
    >
      <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
        <path d="M15 12h-5" />
        <path d="M15 8h-5" />
        <path d="M19 17V5a2 2 0 0 0-2-2H4" />
        <path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3" />
      </svg>
      <p id="rules-overlay-title" className={styles.title} role="heading" aria-level={2}>
        How to Play
      </p>
      <ol id="rules-overlay-message" className={styles.list}>
        <li>
          Reduce your opponent's{" "}
          <span className={`${styles.stat} ${styles.hp}`}>HP</span> to 0 to win.
        </li>
        <li>
          <span className={`${styles.stat} ${styles.mana}`}>Mana</span> grows
          every turn - spend it to play cards from your hand.
        </li>
        <li>Your hand holds up to 5 cards at once.</li>
        <li>
          The match ends the instant either side's{" "}
          <span className={`${styles.stat} ${styles.hp}`}>HP</span> reaches 0.
        </li>
      </ol>
      <a
        className={styles.link}
        href="https://github.com/pparys93/card-duel#readme"
        target="_blank"
        rel="noopener noreferrer"
      >
        Full rules on GitHub
      </a>
      <button type="button" className={styles.button} onClick={onBeginDuel}>
        Begin the Duel
      </button>
    </div>
  );
}

export default RulesOverlay;
