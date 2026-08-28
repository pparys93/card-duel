import styles from "./PlayerPanel.module.css";

interface PlayerPanelProps {
  variant: "enemy" | "player";
  name: string;
  hp: number;
  mana: number;
  // enemy hand size isn't tracked yet - a static placeholder passed by the caller,
  // not real state; add aria-live/aria-atomic on the value if this ever changes (e.g. multiplayer)
  cardCount?: number;
  isActiveTurn?: boolean;
}

function PlayerPanel({
  variant,
  name,
  hp,
  mana,
  cardCount,
  isActiveTurn = true,
}: PlayerPanelProps) {
  const isEnemy = variant === "enemy";

  const panelClassName = `${styles.panel} ${isEnemy ? styles.enemy : styles.player}`;
  const nameClassName = [styles.name, !isActiveTurn && styles.inactive]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={panelClassName} aria-label={`${name} status`}>
      <h2 className={nameClassName}>{name}</h2>
      <dl className={styles.stats} aria-label={`${name} stats`}>
        {isEnemy && cardCount !== undefined && (
          <div className={styles.stat}>
            <dt className={styles.term}>Cards</dt>
            <dd className={styles.value}>{cardCount}</dd>
          </div>
        )}

        <div className={`${styles.stat} ${styles.hp}`}>
          <dt className={styles.term}>HP</dt>
          <dd
            className={styles.value}
            aria-live={isEnemy ? "polite" : "assertive"}
            aria-atomic="true"
          >
            {hp}
          </dd>
        </div>

        <div className={`${styles.stat} ${styles.mana}`}>
          <dt className={styles.term}>Mana</dt>
          <dd className={styles.value} aria-live="polite" aria-atomic="true">
            {mana}
          </dd>
        </div>
      </dl>
    </section>
  );
}

export default PlayerPanel;
