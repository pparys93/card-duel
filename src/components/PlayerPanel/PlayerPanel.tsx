import { useEffect, useRef, useState } from "react";
import styles from "./PlayerPanel.module.css";

interface StatPopup {
  id: string;
  amount: number;
}

interface PlayerPanelProps {
  variant: "enemy" | "player";
  name: string;
  hp: number;
  mana: number;
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
  const previousHpRef = useRef(hp);
  const [popups, setPopups] = useState<StatPopup[]>([]);

  useEffect(() => {
    const delta = hp - previousHpRef.current;
    previousHpRef.current = hp;

    if (delta !== 0) {
      setPopups((current) => [...current, { id: crypto.randomUUID(), amount: delta }]);
    }
  }, [hp]);

  const removePopup = (id: string) => {
    setPopups((current) => current.filter((popup) => popup.id !== id));
  };

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
            {popups.map((popup) => (
              <span
                key={popup.id}
                className={`${styles.statPopup} ${popup.amount < 0 ? styles.negative : styles.positive}`}
                aria-hidden="true"
                onAnimationEnd={() => removePopup(popup.id)}
              >
                {popup.amount > 0 ? `+${popup.amount}` : popup.amount}
              </span>
            ))}
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
