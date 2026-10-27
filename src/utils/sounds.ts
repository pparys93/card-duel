export type SoundName =
  | "buttonClick"
  | "cardDraw"
  | "cardPlace"
  | "cardPreview"
  | "cardSelect"
  | "spellEffect"
  | "gameOver";

const AUDIO_BASE = `${import.meta.env.BASE_URL}assets/audio/`;

const sounds: Record<SoundName, HTMLAudioElement> = {
  buttonClick: new Audio(`${AUDIO_BASE}button-click.mp3`),
  cardDraw: new Audio(`${AUDIO_BASE}card-draw.mp3`),
  cardPlace: new Audio(`${AUDIO_BASE}card-place.mp3`),
  cardPreview: new Audio(`${AUDIO_BASE}card-preview.mp3`),
  cardSelect: new Audio(`${AUDIO_BASE}card-select.mp3`),
  spellEffect: new Audio(`${AUDIO_BASE}spell-effect.mp3`),
  gameOver: new Audio(`${AUDIO_BASE}game-over.mp3`),
};

// mirrors screen-guard's CSS breakpoints in ScreenGuard.module.css - update both if either changes
const SCREEN_GUARD_QUERY =
  "(pointer: coarse) and (max-height: 500px), (pointer: fine) and (max-height: 600px)";

const MUTE_STORAGE_KEY = "cardDuelSoundMuted";

// localStorage throws when the browser blocks site data
function readMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

let muted = readMuted();
const listeners = new Set<() => void>();

export function isSoundMuted(): boolean {
  return muted;
}

export function setSoundMuted(value: boolean): void {
  muted = value;
  try {
    localStorage.setItem(MUTE_STORAGE_KEY, String(value));
  } catch {
    // preference lasts until the page is closed
  }
  listeners.forEach((listener) => listener());
}

// lets React re-render when the flag changes (see useSyncExternalStore in App)
export function subscribeToSoundMuted(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function playSound(name: SoundName) {
  if (muted) return;
  // screen-guard covers the board here; suppress audio feedback for actions the player can't see
  if (window.matchMedia(SCREEN_GUARD_QUERY).matches) return;

  const sound = sounds[name];
  sound.currentTime = 0; // restart if the same sound is still playing (e.g. rapid actions)
  sound.play().catch(() => {}); // ignore playback errors (e.g. autoplay restrictions)
}
