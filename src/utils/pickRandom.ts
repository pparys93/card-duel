export function pickRandom<T>(pool: T[]): T {
  const index = Math.floor(Math.random() * pool.length);
  return pool[index];
}