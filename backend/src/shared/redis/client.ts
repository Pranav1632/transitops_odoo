import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redisClient = createClient({
  url: redisUrl,
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

// Connect to Redis on startup
(async () => {
  try {
    await redisClient.connect();
    console.log('Connected to Redis');
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
  }
})();

/**
 * Caching helper: getOrSetCache
 * @param key Cache key
 * @param ttl Time-to-live in seconds
 * @param fetchFn Asynchronous fallback function to fetch data if cache misses
 */
export async function getOrSetCache<T>(
  key: string,
  ttl: number,
  fetchFn: () => Promise<T>
): Promise<T> {
  try {
    const cachedData = await redisClient.get(key);
    if (cachedData !== null) {
      return JSON.parse(cachedData) as T;
    }
  } catch (error) {
    console.error(`Cache read error for key ${key}:`, error);
  }

  // Cache miss, fetch fresh data
  const freshData = await fetchFn();

  try {
    await redisClient.set(key, JSON.stringify(freshData), {
      EX: ttl,
    });
  } catch (error) {
    console.error(`Cache write error for key ${key}:`, error);
  }

  return freshData;
}
