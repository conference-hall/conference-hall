import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { getEnv } from 'jobs/libs/env/env.ts';

const env = getEnv();

export type JobConfig<Payload> = {
  name: string;
  queue: string;
  run: (payload: Payload) => Promise<void>;
};

export type Job<Payload> = {
  config: JobConfig<Payload>;
  trigger: (payload: Payload) => Promise<void>;
};

const queues = new Map<string, Queue<unknown>>();

export function job<Payload>(config: JobConfig<Payload>): Job<Payload> {
  return {
    config,
    trigger: async (payload: Payload) => {
      if (!queues.has(config.queue)) {
        const connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });
        queues.set(
          config.queue,
          new Queue<Payload>(config.queue, {
            connection,
            defaultJobOptions: {
              attempts: 5,
              backoff: { type: 'exponential', delay: 3000 },
            },
          }),
        );
      }

      const queue = queues.get(config.queue);
      await queue?.add(config.name, payload);
    },
  };
}
