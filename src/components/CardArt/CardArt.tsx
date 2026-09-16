import Icon from "../Icon/Icon";
import type { IconName } from "../../data/icons";
import styles from "./CardArt.module.css";

interface CardArtProps {
  icon: IconName;
  variant?: "hand" | "board";
}

function CardArt({ icon, variant = "hand" }: CardArtProps) {
  const className = [styles.art, variant === "board" && styles.board]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className}>
      <Icon name={icon} />
    </div>
  );
}

export default CardArt;
