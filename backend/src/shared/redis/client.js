"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = void 0;
exports.getOrSetCache = getOrSetCache;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();

// ─── Optional Redis ───────────────────────────────────────────────────────────
// Redis is used only for caching. When unavailable the app falls back to
// hitting the database directly – fully functional without cache.
// ─────────────────────────────────────────────────────────────────────────────

let _client = null;
let _connected = false;

const noopClient = {
    get: async (_k) => null,
    set: async () => {},
    del: async () => {},
};

// Try to connect – fire and forget, server starts regardless
(async () => {
    try {
        const { createClient } = require('redis');
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
        const client = createClient({ url: redisUrl });
        client.on('error', () => {}); // silence errors
        await client.connect();
        _client = client;
        _connected = true;
        console.log('Connected to Redis (cache enabled)');
    } catch (_e) {
        console.log('Redis unavailable – running without cache (DB fallback active)');
    }
})();

exports.redisClient = new Proxy({}, {
    get(_target, prop) {
        const c = _connected ? _client : noopClient;
        return c[prop]?.bind(c);
    },
});

async function getOrSetCache(key, ttl, fetchFn) {
    if (_connected) {
        try {
            const cached = await _client.get(key);
            if (cached !== null) return JSON.parse(cached);
        } catch (_e) { /* ignore */ }
    }
    const freshData = await fetchFn();
    if (_connected) {
        try {
            await _client.set(key, JSON.stringify(freshData), { EX: ttl });
        } catch (_e) { /* ignore */ }
    }
    return freshData;
}