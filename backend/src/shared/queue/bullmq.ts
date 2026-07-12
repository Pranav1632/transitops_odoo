import dotenv from 'dotenv';
dotenv.config();

// ─── Optional BullMQ ─────────────────────────────────────────────────────────
// Queue jobs only work when Redis is running. When Redis is unavailable a
// no-op stub is exported so the rest of the app functions normally.
// ─────────────────────────────────────────────────────────────────────────────

const noopQueue: any = {
  add: async () => null,
  getJobs: async () => [],
  close: async () => {},
};

export let connection: any = null;
export let licenseRemindersQueue: any = noopQueue;

(async () => {
  try {
    const { Queue } = await import('bullmq');
    const redisUrlStr = process.env.REDIS_URL || 'redis://localhost:6379';
    let redisConnection: any;
    try {
      const url = new URL(redisUrlStr);
      redisConnection = {
        host: url.hostname || '127.0.0.1',
        port: parseInt(url.port || '6379', 10),
        username: url.username || undefined,
        password: url.password || undefined,
        maxRetriesPerRequest: null,
      };
    } catch {
      redisConnection = { host: '127.0.0.1', port: 6379, maxRetriesPerRequest: null };
    }
    const q = new Queue('license-reminders', { connection: redisConnection });
    await q.getJobCounts();
    connection = redisConnection;
    licenseRemindersQueue = q;
    console.log('BullMQ queue ready (license-reminders)');
  } catch {
    console.log('BullMQ unavailable – queue disabled (Redis not running)');
  }
})();
