"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.licenseRemindersQueue = exports.connection = void 0;
const bullmq_1 = require("bullmq");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const redisUrlStr = process.env.REDIS_URL || 'redis://localhost:6379';
let redisConnection;
try {
    const url = new URL(redisUrlStr);
    redisConnection = {
        host: url.hostname || '127.0.0.1',
        port: parseInt(url.port || '6379', 10),
        username: url.username || undefined,
        password: url.password || undefined,
    };
}
catch (e) {
    // Fallback to local defaults if URL parsing fails
    redisConnection = {
        host: '127.0.0.1',
        port: 6379,
    };
}
exports.connection = redisConnection;
// Export the license reminders queue
exports.licenseRemindersQueue = new bullmq_1.Queue('license-reminders', {
    connection: redisConnection,
});
//# sourceMappingURL=bullmq.js.map