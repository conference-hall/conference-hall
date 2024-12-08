import { Worker } from 'bullmq';
import { getRedisClient } from '../redis.ts';
import type { Job } from './job.ts';
import { logger } from './logger.ts';

export const DEFAULT_QUEUE = 'default';

export type JobWorker = { queue: string; close: () => Promise<void> };

export function createJobWorkers(jobs: Array<Job<any>>): Array<JobWorker> {
  const jobsByQueue = new Map();
  for (const job of jobs) {
    const { queue = DEFAULT_QUEUE } = job.config;
    if (jobsByQueue.has(queue)) {
      jobsByQueue.get(queue).push(job);
    } else {
      jobsByQueue.set(queue, [job]);
    }
  }

  const workers: Array<JobWorker> = [];
  for (const [queue, tasks] of jobsByQueue.entries()) {
    const worker = createJobWorker(queue, tasks);
    workers.push(worker);
  }
  return workers;
}

function createJobWorker(queue: string, jobs: Array<Job<any>>): JobWorker {
  const connection = getRedisClient();

  const worker = new Worker(
    queue,
    async ({ name, data }) => {
      const job = jobs.find((job) => job.config.name === name);

      if (!job) throw new Error(`Job not found: "${name}"`);

      await job.config.run(data);
    },
    {
      connection: connection,
      concurrency: 1,
      removeOnComplete: { count: 1000 },
      removeOnFail: { count: 1000 },
    },
  );

  worker.on('ready', () => {
    logger.info(`Jobs worker is ready for "${queue}" queue:`);
    for (const job of jobs) {
      logger.info(` - "${job.config.name}" job.`);
    }
  });

  worker.on('completed', (job) => {
    logger.info(`Completed job "${job.name}". Job ID: ${job.id}`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`Failed job "${job?.name}". Job ID: ${job?.id}. ${err}`);
  });

  return {
    queue,
    close: async () => {
      await worker.close();
      await worker.disconnect();
    },
  };
}
