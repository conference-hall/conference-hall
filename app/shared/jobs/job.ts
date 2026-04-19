import { type JobsOptions, Queue } from 'bullmq';
import { getRedisClient } from '../cache/redis.server.ts';
import { DEFAULT_QUEUE } from './worker.ts';

type JobConfig<Payload> = {
  name: string;
  queue?: string;
  run: (payload: Payload) => Promise<void>;
};

export type Job<Payload> = {
  config: JobConfig<Payload>;
  trigger: (payload?: Payload, options?: JobsOptions) => Promise<void>;
};

type CronJobConfig = {
  name: string;
  queue?: string;
  cron: string;
  run: () => Promise<void>;
};

export type CronJob = {
  config: CronJobConfig;
  schedule: () => Promise<void>;
};

const queues = new Map<string, Queue<unknown>>();

function getOrCreateQueue(queueName: string): Queue<unknown> {
  if (!queues.has(queueName)) {
    const connection = getRedisClient();
    queues.set(
      queueName,
      new Queue(queueName, {
        connection,
        defaultJobOptions: {
          attempts: 5,
          backoff: { type: 'exponential', delay: 3000 },
        },
      }),
    );
  }
  return queues.get(queueName)!;
}

export function job<Payload>(config: JobConfig<Payload>): Job<Payload> {
  const { name, queue = DEFAULT_QUEUE } = config;

  return {
    config,
    trigger: async (payload?: Payload, options?: JobsOptions) => {
      const q = getOrCreateQueue(queue);
      await q.add(name, payload, {
        ...options,
        removeOnComplete: true,
        removeOnFail: false,
      });
    },
  };
}

export function cronJob(config: CronJobConfig): CronJob {
  const { name, queue = DEFAULT_QUEUE, cron } = config;

  return {
    config,
    schedule: async () => {
      const q = getOrCreateQueue(queue);
      await q.upsertJobScheduler(name, { pattern: cron }, { name });
    },
  };
}
