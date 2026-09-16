import type { HandCard } from "../../types/card";
import Card from "../Card/Card";
import { getCardFanTransform } from "../../utils/getCardFanTransform";
import styles from "./Hand.module.css";

interface HandProps {
  cards: HandCard[];
  selectedInstanceId: string | null;
  playerMana: number;
  canPlace: boolean;
  onSelectCard?: (instanceId: string) => void;
  onDropCard?: (slotIndex: number) => void;
}

function Hand({
  cards,
  selectedInstanceId,
  playerMana,
  canPlace,
  onSelectCard,
  onDropCard,
}: HandProps) {
  const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

  return (
    <div className={styles.hand} role="group" aria-label="Player hand">
      {cards.map((card, index) => (
        <Card
          key={card.instanceId}
          card={card}
          style={isTouchDevice ? undefined : getCardFanTransform(index, cards.length)}
          selected={selectedInstanceId === card.instanceId}
          affordable={card.mana <= playerMana}
          canPlace={canPlace}
          onSelect={() => onSelectCard?.(card.instanceId)}
          onDrop={onDropCard}
        />
      ))}
    </div>
  );
}

export default Hand;
