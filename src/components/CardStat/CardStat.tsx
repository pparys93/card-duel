import type { CardType } from "../../types/card";
import styles from "./CardStat.module.css";

interface CardStatProps {
  type: CardType;
  value: number;
}

function CardStat({ type, value }: CardStatProps) {
  const label = `${type === "attack" ? "Attack" : "Heal"} ${value}`;

  return (
    <div
      className={`${styles.stat} ${type === "attack" ? styles.attack : styles.heal}`}
      aria-label={label}
    >
      {value}
    </div>
  );
}

export default CardStat;
