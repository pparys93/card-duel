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
