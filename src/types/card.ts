import type { IconName } from "../data/icons";

export type CardType = "attack" | "heal";

export interface CardData {
  id: IconName;
  name: string;
  description: string;
  mana: number;
  stat: number;
  type: CardType;
}

// one copy of a card currently sitting in hand; instanceId tells two draws of the
// same card apart (e.g. two "fireball" cards), since card.id repeats by design
export interface HandCard extends CardData {
  instanceId: string;
}