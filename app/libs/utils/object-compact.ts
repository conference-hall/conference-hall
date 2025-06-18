export function compactObject<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined && v !== null)) as T;
}
