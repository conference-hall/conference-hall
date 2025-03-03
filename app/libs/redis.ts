import { Redis } from 'ioredis';

let redis: Redis | null = null;

export const getRedisClient = () => {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null });
  }
  return redis;
};

export const disconnectRedis = async () => {
  if (redis) {
    await redis.quit();
    redis = null;
  }
};
