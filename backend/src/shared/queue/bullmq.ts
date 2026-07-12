import { Queue } from 'bullmq';
import dotenv from 'dotenv';

dotenv.config();

const redisUrlStr = process.env.REDIS_URL || 'redis://localhost:6379';
let redisConnection: any;

try {
  const url = new URL(redisUrlStr);
  redisConnection = {
    host: url.hostname || '127.0.0.1',
    port: parseInt(url.port || '6379', 10),
    username: url.username || undefined,
    password: url.password || undefined,
  };
} catch (e) {
  // Fallback to local defaults if URL parsing fails
  redisConnection = {
    host: '127.0.0.1',
    port: 6379,
  };
}

export const connection = redisConnection;

// Export the license reminders queue
export const licenseRemindersQueue = new Queue('license-reminders', {
  connection: redisConnection,
});
