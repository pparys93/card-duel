import type { CardType } from "../../types/card";
import styles from "./CardStat.module.css";

interface CardStatProps {
  type: CardType;
  value: number;
  variant?: "hand" | "board";
}

function CardStat({ type, value, variant = "hand" }: CardStatProps) {
  const label = `${type === "attack" ? "Attack" : "Heal"} ${value}`;

  const className = [
    styles.stat,
    type === "attack" ? styles.attack : styles.heal,
    variant === "board" && styles.board,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className} aria-label={label}>
      {value}
    </div>
  );
}

export default CardStat;
