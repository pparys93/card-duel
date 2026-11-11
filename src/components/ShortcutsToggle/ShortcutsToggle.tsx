import styles from "./ShortcutsToggle.module.css";

interface ShortcutsToggleProps {
  enabled: boolean;
  onToggle?: () => void;
}

function ShortcutsToggle({ enabled, onToggle }: ShortcutsToggleProps) {
  return (
    <button type="button" className={styles.toggle} aria-pressed={enabled} onClick={onToggle}>
      Keyboard shortcuts <span aria-hidden="true">{enabled ? "ON" : "OFF"}</span>
    </button>
  );
}

export default ShortcutsToggle;
