import type { CSSProperties } from "react";

const MAX_CARD_ROTATION_DEG = 10;
const MAX_CARD_LIFT_PX = 16;

export function getCardFanTransform(index: number, count: number): CSSProperties {
  const mid = (count - 1) / 2;
  const offset = index - mid; // negative = left of center, positive = right
  const maxOffset = mid || 1; // avoid divide-by-zero when count is 1
  const ratio = offset / maxOffset; // normalized from -1 to 1

  return {
    "--card-rotation": `${(ratio * MAX_CARD_ROTATION_DEG).toFixed(2)}deg`,
    // lift uses squared ratio (not linear) so cards near the center stay low and flat
    // while lift accelerates toward the edges; mimics a natural fan curve
    "--card-lift": `${Math.pow(Math.abs(ratio), 2) * MAX_CARD_LIFT_PX}px`,
  } as CSSProperties;
}
