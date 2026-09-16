// freezes an object/array and everything nested inside it; a shallow Object.freeze()
// only locks the outer layer, missing nested structures like icons.ts's shapes[]
export function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === "object") {
    Object.getOwnPropertyNames(value).forEach((key) => {
      const prop = (value as Record<string, unknown>)[key];
      if (prop !== null && typeof prop === "object" && !Object.isFrozen(prop)) {
        deepFreeze(prop);
      }
    });
    Object.freeze(value);
  }
  return value;
}
