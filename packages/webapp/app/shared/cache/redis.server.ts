import { getSharedServerEnv } from '@conference-hall/shared/environment.ts';
import { Redis } from 'ioredis';

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
