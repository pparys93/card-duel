import { useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, PointerEvent } from "react";
import type { CardData } from "../../types/card";
import { playSound } from "../../utils/sounds";
import CardManaBadge from "../CardManaBadge/CardManaBadge";
import CardArt from "../CardArt/CardArt";
import CardContent from "../CardContent/CardContent";
import CardStat from "../CardStat/CardStat";
import styles from "./Card.module.css";

const DRAG_THRESHOLD_PX = 8;
const supportsDrag = window.matchMedia("(pointer: fine)").matches;
// touch devices use tap-to-select/tap-to-place instead;
// dragging would conflict with horizontal hand scrolling

interface CardProps {
  card: CardData;
  selected?: boolean;
  affordable?: boolean;
  canPlace?: boolean;
  onSelect?: () => void;
  onDrop?: (slotIndex: number) => void;
  style?: CSSProperties;
}

function Card({
  card,
  selected = false,
  affordable = true,
  canPlace = true,
  onSelect,
  onDrop,
  style,
}: CardProps) {
  const articleRef = useRef<HTMLElement>(null);
  const suppressClickRef = useRef(false);
  const dragState = useRef({
    startX: 0,
    startY: 0,
    active: false,
    dragging: false,
    dropTarget: null as HTMLElement | null,
  });
  const [isDragging, setIsDragging] = useState(false);

  const endDrag = () => {
    articleRef.current?.style.removeProperty("transform");
    setIsDragging(false);
    dragState.current.dropTarget?.removeAttribute("data-drop-active");
    dragState.current = { startX: 0, startY: 0, active: false, dragging: false, dropTarget: null };
  };

  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    if (!supportsDrag) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;

    dragState.current.startX = event.clientX;
    dragState.current.startY = event.clientY;
    dragState.current.active = true;
    // keeps pointermove/pointerup targeting this card even if the cursor
    // moves over other elements (e.g. a board slot) mid-gesture
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    const state = dragState.current;
    if (!state.active) return;

    const dx = event.clientX - state.startX;
    const dy = event.clientY - state.startY;

    if (!state.dragging) {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;
      if (!affordable || !canPlace) return;

      state.dragging = true;
      setIsDragging(true);
      onSelect?.();
    }

    if (articleRef.current) {
      articleRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
    }

    // pointer capture keeps event.target on the card, so look up the element
    // under the cursor manually; update the highlight only when the target changes
    const target =
      document
        .elementFromPoint(event.clientX, event.clientY)
        ?.closest<HTMLElement>('[data-drop-target="true"]') ?? null;

    if (target !== state.dropTarget) {
      state.dropTarget?.removeAttribute("data-drop-active");
      target?.setAttribute("data-drop-active", "true");
      state.dropTarget = target;
    }
  };

  const handlePointerUp = () => {
    const state = dragState.current;
    if (!state.dragging) {
      state.active = false;
      return; // plain click - onClick takes over
    }

    const dropTarget = state.dropTarget;
    endDrag();

    // the browser still fires a click after this gesture despite the movement;
    // suppress it so it doesn't immediately toggle the card back off via onSelect
    suppressClickRef.current = true;

    const slotIndex = dropTarget?.dataset.slotIndex;
    if (slotIndex !== undefined) {
      onDrop?.(Number(slotIndex));
    }
  };

  const handleClick = () => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    onSelect?.();
  };

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
    isDragging && styles.dragging,
  ]
    .filter(Boolean)
    .join(" ");

  const handlePointerEnter = () => {
    if (!selected) playSound("cardPreview");
  };

  return (
    <article
      ref={articleRef}
      className={classNames}
      style={style}
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={endDrag}
      onPointerEnter={handlePointerEnter}
    >
      <CardManaBadge mana={card.mana} />
      <CardArt icon={card.id} />
      <CardContent name={card.name} description={card.description} />
      <CardStat type={card.type} value={card.stat} />
    </article>
  );
}

export default Card;
