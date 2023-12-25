import { Worker } from 'bullmq';
import Redis from 'ioredis';
import { getEnv } from 'jobs/libs/env/env';

import { processor } from './email.processor';

const env = getEnv();

const connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });

export const worker = new Worker('default', processor, {
  connection: connection,
  concurrency: 1,
  removeOnComplete: { count: 1000 },
  removeOnFail: { count: 1000 },
});
