export declare const redisClient: import("redis").RedisClientType<{}, {}, {}, 3, {}>;
/**
 * Caching helper: getOrSetCache
 * @param key Cache key
 * @param ttl Time-to-live in seconds
 * @param fetchFn Asynchronous fallback function to fetch data if cache misses
 */
export declare function getOrSetCache<T>(key: string, ttl: number, fetchFn: () => Promise<T>): Promise<T>;
//# sourceMappingURL=client.d.ts.map