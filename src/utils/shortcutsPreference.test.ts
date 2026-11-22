import { afterEach, describe, expect, it, vi } from "vitest";

const STORAGE_KEY = "cardDuelShortcutsEnabled";

// the module keeps its flag at module level, so every test loads a fresh copy
async function load() {
  vi.resetModules();
  return import("./shortcutsPreference");
}

function fakeStorage(initial: Record<string, string> = {}) {
  const data = { ...initial };
  return {
    data,
    getItem: (key: string) => data[key] ?? null,
    setItem: (key: string, value: string) => {
      data[key] = value;
    },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("shortcuts preference", () => {
  it("is on by default, also when there is no storage at all", async () => {
    const { isShortcutsEnabled } = await load(); // the node test environment has no localStorage
    expect(isShortcutsEnabled()).toBe(true);
  });

    it("is on by default when storage is available but holds no value yet", async () => {
    vi.stubGlobal("localStorage", fakeStorage());
    const { isShortcutsEnabled } = await load();
    expect(isShortcutsEnabled()).toBe(true);
  });

  it("is off when the stored value says so", async () => {
    vi.stubGlobal("localStorage", fakeStorage({ [STORAGE_KEY]: "false" }));
    const { isShortcutsEnabled } = await load();
    expect(isShortcutsEnabled()).toBe(false);
  });

  it("saves the choice and notifies subscribers", async () => {
    const storage = fakeStorage();
    vi.stubGlobal("localStorage", storage);
    const { isShortcutsEnabled, setShortcutsEnabled, subscribeToShortcutsEnabled } = await load();
    const listener = vi.fn();
    subscribeToShortcutsEnabled(listener);

    setShortcutsEnabled(false);

    expect(isShortcutsEnabled()).toBe(false);
    expect(storage.data[STORAGE_KEY]).toBe("false");
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("stops notifying after unsubscribing", async () => {
    const { setShortcutsEnabled, subscribeToShortcutsEnabled } = await load();
    const listener = vi.fn();
    const unsubscribe = subscribeToShortcutsEnabled(listener);

    unsubscribe();
    setShortcutsEnabled(false);

    expect(listener).not.toHaveBeenCalled();
  });

  it("keeps the choice for the session when the browser blocks storage", async () => {
    const blocked = () => {
      throw new Error("storage blocked");
    };
    vi.stubGlobal("localStorage", { getItem: blocked, setItem: blocked });
    const { isShortcutsEnabled, setShortcutsEnabled } = await load();
    expect(isShortcutsEnabled()).toBe(true);

    setShortcutsEnabled(false);

    expect(isShortcutsEnabled()).toBe(false);
  });
});
