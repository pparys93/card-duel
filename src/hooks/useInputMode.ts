import { useEffect } from "react";

// keys that act on the focused element, so a player steering by keyboard presses them
const KEYBOARD_NAV_KEYS = new Set(["Tab", "Enter", " "]);

// like :focus-visible: a navigation key turns on "keyboard" mode, a pointer press turns it off;
// only an attribute on <html> (read by CSS), so a mode change never re-renders React
export function useInputMode() {
  useEffect(() => {
    const root = document.documentElement;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (KEYBOARD_NAV_KEYS.has(event.key)) {
        root.dataset.input = "keyboard";
      }
    };

    const handlePointerDown = () => {
      delete root.dataset.input;
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
      delete root.dataset.input;
    };
  }, []);
}
