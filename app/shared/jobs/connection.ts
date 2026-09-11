import { createNodeRedisClient } from 'bullmq';
import { getRedisClient } from '../cache/redis.server.ts';
import { logger } from '../logger/logger.server.ts';

let connection: ReturnType<typeof createNodeRedisClient> | null = null;

export function getJobsConnection() {
  if (!connection) {
    connection = createNodeRedisClient(getRedisClient());
    connection.on('error', (error) => {
      logger.error({ error }, 'Jobs Redis client error');
    });
  }
  return connection;
}
