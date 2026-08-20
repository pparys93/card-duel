import styles from "./CardContent.module.css";

interface CardContentProps {
  name: string;
  description: string;
}

function CardContent({ name, description }: CardContentProps) {
  return (
    <div className={styles.content}>
      <h3 className={styles.title}>{name}</h3>
      <p className={styles.description}>{description}</p>
    </div>
  );
}

export default CardContent;
