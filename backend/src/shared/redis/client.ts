import dotenv from 'dotenv';
dotenv.config();

// ─── Optional Redis ─────────────────────────────────────────────────────────
// Redis is used only for caching. If it is unavailable the app falls back to
// hitting the database directly on every request – fully functional, just
// without the cache speed-up.
// ─────────────────────────────────────────────────────────────────────────────

let _client: any = null;
let _connected = false;

async function tryConnect() {
  try {
    const { createClient } = await import('redis');
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    const client = createClient({ url: redisUrl });
    client.on('error', () => {}); // silence connection errors
    await client.connect();
    _client = client;
    _connected = true;
    console.log('Connected to Redis (cache enabled)');
  } catch {
    // Redis not available – that is fine, we will use DB directly
    console.log('Redis unavailable – running without cache (DB fallback active)');
  }
}

// Fire and forget – server starts regardless
tryConnect();

/** No-op stub used when Redis is unavailable */
const noopClient = {
  get: async (_k: string) => null,
  set: async () => {},
  del: async () => {},
};

export const redisClient = new Proxy({} as any, {
  get(_target, prop: string) {
    const c = _connected ? _client : noopClient;
    return (c as any)[prop]?.bind(c);
  },
});

/**
 * Caching helper – always falls back to fetchFn if Redis is unavailable.
 */
export async function getOrSetCache<T>(
  key: string,
  ttl: number,
  fetchFn: () => Promise<T>
): Promise<T> {
  if (_connected) {
    try {
      const cached = await _client.get(key);
      if (cached !== null) return JSON.parse(cached) as T;
    } catch { /* ignore */ }
  }

  const freshData = await fetchFn();

  if (_connected) {
    try {
      await _client.set(key, JSON.stringify(freshData), { EX: ttl });
    } catch { /* ignore */ }
  }

  return freshData;
}
