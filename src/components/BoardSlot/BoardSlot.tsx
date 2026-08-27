import type { CardData } from "../../types/card";
import BoardCard from "../BoardCard/BoardCard";
import styles from "./BoardSlot.module.css";

interface BoardSlotProps {
  variant: "enemy" | "player";
  label: string;
  card?: CardData;
  onPlace?: () => void;
}

function BoardSlot({ variant, label, card, onPlace }: BoardSlotProps) {
  const className = [
    styles.slot,
    variant === "enemy" && styles.inactive,
    card && styles.occupied,
  ]
    .filter(Boolean)
    .join(" ");

  const content = card ? <BoardCard card={card} /> : null;

  if (variant === "enemy") {
    return (
      <div className={className} aria-label={label}>
        {content}
      </div>
    );
  }

  return (
    <button
      type="button"
      className={className}
      aria-label={card ? `${label}, occupied by ${card.name}` : label}
      onClick={onPlace}
      disabled={Boolean(card)}
    >
      {content}
    </button>
  );
}

export default BoardSlot;
