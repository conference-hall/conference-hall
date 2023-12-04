import { Worker } from 'bullmq';
import Redis from 'ioredis';

import { config } from '~/libs/config';

import { processor } from './email.processor';

const connection = new Redis(config.REDIS_URL, { maxRetriesPerRequest: null });

export const worker = new Worker('default', processor, {
  connection: connection,
  concurrency: 1,
  removeOnComplete: { count: 1000 },
  removeOnFail: { count: 1000 },
});
