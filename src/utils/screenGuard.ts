// mirrors screen-guard's CSS breakpoints in ScreenGuard.module.css - update both if either changes
const SCREEN_GUARD_QUERY =
  "(pointer: coarse) and (max-height: 500px), (pointer: fine) and (max-height: 600px)";

// true while the screen guard covers the board
export function isScreenGuardActive(): boolean {
  return window.matchMedia(SCREEN_GUARD_QUERY).matches;
}