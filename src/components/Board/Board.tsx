import type { CardData } from "../../types/card";
import BoardSlot from "../BoardSlot/BoardSlot";
import styles from "./Board.module.css";

interface BoardProps {
  variant: "enemy" | "player";
  slots: (CardData | undefined)[];
  onPlaceCard?: (slotIndex: number) => void;
}

function Board({ variant, slots, onPlaceCard }: BoardProps) {
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
          onPlace={variant === "player" ? () => onPlaceCard?.(index) : undefined}
        />
      ))}
    </div>
  );
}

export default Board;
