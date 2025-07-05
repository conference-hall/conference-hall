import { Queue } from 'bullmq';
import { getRedisClient } from '../../shared/cache/redis.server.ts';
import { DEFAULT_QUEUE } from './worker.ts';

type JobConfig<Payload> = {
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
        const connection = getRedisClient();

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
