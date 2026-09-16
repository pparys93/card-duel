import type { CardData } from "../../types/card";
import CardArt from "../CardArt/CardArt";
import CardStat from "../CardStat/CardStat";
import styles from "./BoardCard.module.css";

interface BoardCardProps {
  card: CardData;
}

function BoardCard({ card }: BoardCardProps) {
  return (
    <div className={styles.card}>
      <CardArt icon={card.id} variant="board" />
      <CardStat type={card.type} value={card.stat} variant="board" />
    </div>
  );
}

export default BoardCard;
