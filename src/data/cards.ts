import type { CardData } from "../types/card";
import { deepFreeze } from "../utils/deepFreeze";

// deepFreeze() blocks runtime mutation (e.g. cards[0].mana = 999); TS types alone
// can't, since they're erased at compile time - see deepFreeze.ts
export const cards: CardData[] = deepFreeze([
  // #region [TYPE: ATTACK] ---------------------------->
  { id: "ensnare", name: "Ensnare", description: "Trap enemies.", mana: 1, stat: 3, type: "attack" },
  { id: "fireball", name: "Fireball", description: "Burns everything.", mana: 6, stat: 7, type: "attack" },
  { id: "frostbite", name: "Frostbite", description: "Temporary freeze.", mana: 1, stat: 3, type: "attack" },
  { id: "lightning", name: "Lightning", description: "Immediately shock.", mana: 3, stat: 2, type: "attack" },
  { id: "precision", name: "Precision", description: "Strikes with accuracy.", mana: 4, stat: 3, type: "attack" },
  { id: "sunfire", name: "Sunfire", description: "Explosive flame.", mana: 1, stat: 3, type: "attack" },
  // #endregion

  // #region [TYPE: HEAL] ------------------------------>
  { id: "absorb", name: "Absorb", description: "Additional health.", mana: 2, stat: 3, type: "heal" },
  { id: "healing", name: "Healing", description: "Restore vitality.", mana: 2, stat: 4, type: "heal" },
  { id: "potion", name: "Potion", description: "Restore health.", mana: 2, stat: 1, type: "heal" },
  { id: "shield", name: "Shield", description: "Magical protection.", mana: 2, stat: 6, type: "heal" },
  // #endregion
]);
