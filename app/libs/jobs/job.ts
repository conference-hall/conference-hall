import { Queue } from 'bullmq';
import Redis from 'ioredis';

import { getEnv } from './env.ts';
import { DEFAULT_QUEUE } from './worker.ts';

const env = getEnv();

export type JobConfig<Payload> = {
  name: string;
  queue?: string;
  run: (payload: Payload) => Promise<void>;
};

export type Job<Payload> = {
  config: JobConfig<Payload>;
  trigger: (payload?: Payload) => Promise<void>;
};

const queues = new Map<string, Queue<unknown>>();

export function job<Payload>(config: JobConfig<Payload>): Job<Payload> {
  const { name, queue = DEFAULT_QUEUE } = config;

  return {
    config,
    trigger: async (payload?: Payload) => {
      if (!queues.has(queue)) {
        const connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });

        queues.set(
          queue,
          new Queue<Payload>(queue, {
            connection,
            defaultJobOptions: {
              attempts: 5,
              backoff: { type: 'exponential', delay: 3000 },
            },
          }),
        );
      }

      await queues.get(queue)?.add(name, payload);
    },
  };
}