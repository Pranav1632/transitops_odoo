"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = void 0;
exports.getOrSetCache = getOrSetCache;
const redis_1 = require("redis");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
exports.redisClient = (0, redis_1.createClient)({
    url: redisUrl,
});
exports.redisClient.on('error', (err) => console.error('Redis Client Error', err));
// Connect to Redis on startup
(async () => {
    try {
        await exports.redisClient.connect();
        console.log('Connected to Redis');
    }
    catch (error) {
        console.error('Failed to connect to Redis:', error);
    }
})();
/**
 * Caching helper: getOrSetCache
 * @param key Cache key
 * @param ttl Time-to-live in seconds
 * @param fetchFn Asynchronous fallback function to fetch data if cache misses
 */
async function getOrSetCache(key, ttl, fetchFn) {
    try {
        const cachedData = await exports.redisClient.get(key);
        if (cachedData !== null) {
            return JSON.parse(cachedData);
        }
    }
    catch (error) {
        console.error(`Cache read error for key ${key}:`, error);
    }
    // Cache miss, fetch fresh data
    const freshData = await fetchFn();
    try {
        await exports.redisClient.set(key, JSON.stringify(freshData), {
            EX: ttl,
        });
    }
    catch (error) {
        console.error(`Cache write error for key ${key}:`, error);
    }
    return freshData;
}
//# sourceMappingURL=client.js.map