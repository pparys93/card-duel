import type { KeyboardEvent } from "react";
import type { CardData } from "../../types/card";
import CardManaBadge from "../CardManaBadge/CardManaBadge";
import CardArt from "../CardArt/CardArt";
import CardContent from "../CardContent/CardContent";
import CardStat from "../CardStat/CardStat";
import styles from "./Card.module.css";

interface CardProps {
  card: CardData;
  selected?: boolean;
  affordable?: boolean;
  onSelect?: () => void;
}

function Card({ card, selected = false, affordable = true, onSelect }: CardProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect?.();
    }
  };

  const classNames = [
    styles.card,
    selected && styles.selected,
    !affordable && styles.unaffordable,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article
      className={classNames}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
    >
      <CardManaBadge mana={card.mana} />
      <CardArt icon={card.id} />
      <CardContent name={card.name} description={card.description} />
      <CardStat type={card.type} value={card.stat} />
    </article>
  );
}

export default Card;
