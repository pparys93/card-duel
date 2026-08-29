import styles from "./ScreenGuard.module.css";

function ScreenGuard() {
  return (
    <div className={styles.guard} role="alert">
      <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
        <rect x="5" y="2" width="14" height="20" rx="2" />
      </svg>
      <p className={styles.title} role="heading" aria-level={2}>
        Rotate Your Device
      </p>
      <p className={styles.message}>
        The battlefield requires more space. Rotate your device or extend
        your browser window vertically to continue.
      </p>
    </div>
  );
}

export default ScreenGuard;
