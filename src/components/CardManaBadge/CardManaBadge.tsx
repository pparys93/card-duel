import styles from "./CardManaBadge.module.css";

interface CardManaBadgeProps {
  mana: number;
}

function CardManaBadge({ mana }: CardManaBadgeProps) {
  return (
    <div className={styles.mana} aria-label={`Mana cost ${mana}`}>
      {mana}
    </div>
  );
}

export default CardManaBadge;
