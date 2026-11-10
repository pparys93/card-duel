const STORAGE_KEY = "cardDuelShortcutsEnabled";

// localStorage throws when the browser blocks site data; shortcuts then stay on
function readEnabled(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "false";
  } catch {
    return true;
  }
}

let enabled = readEnabled();
const listeners = new Set<() => void>();

export function isShortcutsEnabled(): boolean {
  return enabled;
}

export function setShortcutsEnabled(value: boolean): void {
  enabled = value;
  try {
    localStorage.setItem(STORAGE_KEY, String(value));
  } catch {
    // preference lasts until the page is closed
  }
  listeners.forEach((listener) => listener());
}

// lets React re-render when the flag changes (see useSyncExternalStore in App)
export function subscribeToShortcutsEnabled(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
