import type { CardData } from "../../types/card";
import BoardSlot from "../BoardSlot/BoardSlot";
import styles from "./Board.module.css";

interface BoardProps {
  variant: "enemy" | "player";
  slots: (CardData | undefined)[];
  highlightEmptySlots?: boolean;
  onPlaceCard?: (slotIndex: number) => void;
}

function Board({ variant, slots, highlightEmptySlots = false, onPlaceCard }: BoardProps) {
  const className = `${styles.board} ${variant === "enemy" ? styles.enemy : styles.player}`;
  const sideLabel = variant === "enemy" ? "Enemy" : "Player";

  return (
    <div className={className} role="group" aria-label={`${sideLabel} board`}>
      {slots.map((card, index) => (
        <BoardSlot
          key={index}
          variant={variant}
          label={`${sideLabel} slot ${index + 1}`}
          card={card}
          index={index}
          highlighted={variant === "player" && highlightEmptySlots}
          onPlace={variant === "player" ? () => onPlaceCard?.(index) : undefined}
        />
      ))}
    </div>
  );
}

export default Board;
