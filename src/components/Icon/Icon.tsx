import { icons, type IconName } from "../../data/icons";
import styles from "./Icon.module.css";

interface IconProps {
  name: IconName;
}

function Icon({ name }: IconProps) {
  const { color, shapes } = icons[name];

  return (
    <svg
      className={`${styles.icon} ${styles[color]}`}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      {shapes.map((shape, index) =>
        shape.type === "path" ? (
          <path key={index} d={shape.d} />
        ) : (
          <circle key={index} cx={shape.cx} cy={shape.cy} r={shape.r} />
        ),
      )}
    </svg>
  );
}

export default Icon;
