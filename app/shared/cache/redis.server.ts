import { Redis } from 'ioredis';
import { getSharedServerEnv } from 'servers/environment.server.ts';

const { REDIS_URL } = getSharedServerEnv();

let redis: Redis | null = null;

export const getRedisClient = () => {
  if (!redis) {
    redis = new Redis(REDIS_URL, { maxRetriesPerRequest: null });
  }
  return redis;
};

export const disconnectRedis = async () => {
  if (redis) {
    await redis.quit();
    redis = null;
  }
};
