import type { CardData, HandCard } from "../types/card";
import { MAX_HAND_SIZE } from "../game/constants";

// Fisher-Yates shuffle guarantees at least one card the player can currently afford,
// swapping out the hand's priciest card for an affordable leftover if none qualify
export function drawHand(
  cards: CardData[],
  currentMana: number,
  count: number = MAX_HAND_SIZE,
): HandCard[] {
  const shuffled = [...cards];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const hand = shuffled.slice(0, count);
  const hasPlayableCard = hand.some((card) => card.mana <= currentMana);

  if (!hasPlayableCard) {
    const affordableLeftover = shuffled
      .slice(count)
      .filter((card) => card.mana <= currentMana);

    if (affordableLeftover.length > 0) {
      let mostExpensiveIndex = 0;
      hand.forEach((card, i) => {
        if (card.mana > hand[mostExpensiveIndex].mana) mostExpensiveIndex = i;
      });
      hand[mostExpensiveIndex] = affordableLeftover[0];
    }
  }

  return hand.map((card) => ({ ...card, instanceId: crypto.randomUUID() }));
}
