"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.licenseRemindersQueue = exports.connection = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();

// ─── Optional BullMQ ─────────────────────────────────────────────────────────
// Queue jobs only work when Redis is running. When Redis is unavailable we
// export a no-op queue stub so the rest of the app runs normally.
// ─────────────────────────────────────────────────────────────────────────────

const noopQueue = {
    add: async () => null,
    getJobs: async () => [],
    close: async () => {},
};

let _queue = noopQueue;
exports.connection = null;
exports.licenseRemindersQueue = noopQueue;

(async () => {
    try {
        const { Queue } = require('bullmq');
        const redisUrlStr = process.env.REDIS_URL || 'redis://localhost:6379';
        let redisConnection;
        try {
            const url = new URL(redisUrlStr);
            redisConnection = {
                host: url.hostname || '127.0.0.1',
                port: parseInt(url.port || '6379', 10),
                username: url.username || undefined,
                password: url.password || undefined,
                maxRetriesPerRequest: null,
            };
        } catch (_e) {
            redisConnection = { host: '127.0.0.1', port: 6379, maxRetriesPerRequest: null };
        }
        const q = new Queue('license-reminders', {
            connection: redisConnection,
        });
        // Quick connectivity check
        await q.getJobCounts();
        exports.connection = redisConnection;
        exports.licenseRemindersQueue = q;
        console.log('BullMQ queue ready (license-reminders)');
    } catch (_e) {
        console.log('BullMQ unavailable – queue disabled (Redis not running)');
    }
})();