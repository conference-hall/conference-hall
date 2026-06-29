import { type JobsOptions, Queue } from 'bullmq';
import { getRedisClient } from '../cache/redis.server.ts';
import { DEFAULT_QUEUE } from './worker.ts';

// Cron-style recurring schedule for a job. Registered as a BullMQ Job Scheduler on worker startup,
// so the schedule lives in Redis and survives restarts (see docs/adr/0001).
type JobRepeatOptions = { pattern: string; tz?: string };

type JobConfig<Payload> = {
  name: string;
  queue?: string;
  repeat?: JobRepeatOptions;
  run: (payload: Payload) => Promise<void>;
};

export type Job<Payload> = {
  config: JobConfig<Payload>;
  trigger: (payload?: Payload, options?: JobsOptions) => Promise<void>;
};

const queues = new Map<string, Queue<unknown>>();

function getQueue(queue: string): Queue<unknown> {
  if (!queues.has(queue)) {
    const connection = getRedisClient();

    queues.set(
      queue,
      new Queue(queue, {
        connection,
        defaultJobOptions: {
          attempts: 5,
          backoff: { type: 'exponential', delay: 3000 },
        },
      }),
    );
  }

  return queues.get(queue) as Queue<unknown>;
}

export function job<Payload>(config: JobConfig<Payload>): Job<Payload> {
  const { name, queue = DEFAULT_QUEUE } = config;

  return {
    config,
    trigger: async (payload?: Payload, options?: JobsOptions) => {
      await getQueue(queue).add(name, payload, {
        ...options,
        removeOnComplete: true,
        removeOnFail: false,
      });
    },
  };
}

// Register a BullMQ Job Scheduler for every job that declares a `repeat` config. Using the job name as
// the scheduler id makes this idempotent: re-running it on each restart upserts (never duplicates) the
// schedule. Called once on worker startup.
export async function registerJobSchedulers(jobs: Array<Job<any>>): Promise<void> {
  for (const { config } of jobs) {
    if (!config.repeat) continue;

    const queue = getQueue(config.queue ?? DEFAULT_QUEUE);
    await queue.upsertJobScheduler(
      config.name,
      { pattern: config.repeat.pattern, tz: config.repeat.tz },
      { name: config.name },
    );
  }
}
