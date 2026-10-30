interface Entry<T> { value: T; expires: number; }
export class TTLCache<T = unknown> {
  private store = new Map<string, Entry<T>>();
  constructor(private defaultTtlMs = 30_000) {}
  get(key: string): T | undefined {
    const e = this.store.get(key);
    if (!e) return undefined;
    if (e.expires < Date.now()) { this.store.delete(key); return undefined; }
    return e.value;
  }
  set(key: string, value: T, ttlMs?: number): void {
    this.store.set(key, { value, expires: Date.now() + (ttlMs ?? this.defaultTtlMs) });
  }
  delete(key: string): void { this.store.delete(key); }
  invalidatePrefix(prefix: string): void {
    for (const k of this.store.keys()) if (k.startsWith(prefix)) this.store.delete(k);
  }
  clear(): void { this.store.clear(); }
}
export const cache = new TTLCache(30_000);
