import Icon from "../Icon/Icon";
import type { IconName } from "../../data/icons";
import styles from "./CardArt.module.css";

interface CardArtProps {
  icon: IconName;
}

function CardArt({ icon }: CardArtProps) {
  return (
    <div className={styles.art}>
      <Icon name={icon} />
    </div>
  );
}

export default CardArt;
