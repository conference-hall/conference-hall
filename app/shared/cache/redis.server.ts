import { createClient } from 'redis';
import { getSharedServerEnv } from '../../../servers/environment.server.ts';
import { logger } from '../logger/logger.server.ts';

const { REDIS_URL } = getSharedServerEnv();

const redis = createClient({
  url: REDIS_URL,
  commandOptions: { timeout: undefined }, // Keep commands queued during a reconnect.
  maintNotifications: 'disabled',
});

redis.on('error', (error) => {
  logger.error({ error }, 'Redis client error');
});

// Not awaited on purpose. Commands queue until ready and the server boots with Redis down.
// Awaiting here blocks boot forever instead.
redis.connect().catch((error) => {
  logger.error({ error }, 'Redis initial connection failed');
});

export const getRedisClient = () => redis;

export async function disconnectRedis() {
  if (!redis.isOpen) return;
  await redis.close();
}

export async function resetRedis() {
  await redis.flushDb();
}
