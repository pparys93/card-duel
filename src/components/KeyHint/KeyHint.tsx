import styles from "./KeyHint.module.css";

interface KeyHintProps {
  keys: string;
  className?: string; // the parent decides where the hint sits
}

// aria-hidden: assistive tech reads the shortcut from aria-keyshortcuts on the element itself
function KeyHint({ keys, className }: KeyHintProps) {
  const classNames = [styles.hint, className].filter(Boolean).join(" ");

  return (
    <kbd className={classNames} aria-hidden="true">
      {keys}
    </kbd>
  );
}

export default KeyHint;
