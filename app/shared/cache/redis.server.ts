import { Redis } from 'ioredis';
import { getSharedServerEnv } from '../../../servers/environment.server.ts';

const { REDIS_URL } = getSharedServerEnv();

let redis: Redis | null = null;

export const getRedisClient = () => {
  if (!redis) {
    redis = new Redis(REDIS_URL, { maxRetriesPerRequest: null });
  }
  return redis;
};

export async function disconnectRedis() {
  if (!redis) return;
  await redis.quit();
  redis = null;
}

export async function resetRedis() {
  if (!redis) return;
  await redis.flushdb();
}
