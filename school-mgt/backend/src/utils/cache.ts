import Redis from 'ioredis';

let redis: Redis | null = null;
try {
  if (process.env.REDIS_URL) redis = new Redis(process.env.REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 1 });
  redis?.on('error', () => {});
} catch {
  redis = null;
}

const memory = new Map<string, { value: string; expires: number }>();

export const cache = {
  async get<T>(key: string): Promise<T | undefined> {
    if (redis) {
      try {
        const v = await redis.get(key);
        if (v !== null) return JSON.parse(v) as T;
      } catch {}
    }
    const e = memory.get(key);
    if (e && e.expires > Date.now()) return JSON.parse(e.value) as T;
    memory.delete(key);
    return undefined;
  },
  async set<T>(key: string, value: T, ttlMs = 30_000): Promise<void> {
    const s = JSON.stringify(value);
    if (redis) {
      try { await redis.set(key, s, 'PX', ttlMs); } catch {}
    }
    memory.set(key, { value: s, expires: Date.now() + ttlMs });
  },
  async invalidatePrefix(prefix: string): Promise<void> {
    if (redis) {
      try {
        const keys = await redis.keys(`${prefix}*`);
        if (keys.length) await redis.del(...keys);
      } catch {}
    }
    for (const k of memory.keys()) if (k.startsWith(prefix)) memory.delete(k);
  },
};
