import type { HandCard } from "../../types/card";
import Card from "../Card/Card";
import { getCardFanTransform } from "../../utils/getCardFanTransform";
import styles from "./Hand.module.css";

interface HandProps {
  cards: HandCard[];
  selectedInstanceId: string | null;
  playerMana: number;
  onSelectCard?: (instanceId: string) => void;
}

function Hand({ cards, selectedInstanceId, playerMana, onSelectCard }: HandProps) {
  // skip the fan effect on touch devices - pointers don't benefit from the extra
  // rotation/lift, so cards stay flat and rely on the mobile overlap style instead
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
          onSelect={() => onSelectCard?.(card.instanceId)}
        />
      ))}
    </div>
  );
}

export default Hand;
