import { Worker } from 'bullmq';
import { logger } from '~/shared/logger/logger.server.ts';
import { getRedisClient } from '../cache/redis.server.ts';
import type { CronJob, Job } from './job.ts';

export const DEFAULT_QUEUE = 'default';

type AnyJob = Job<any> | CronJob;

type JobWorker = { queue: string; close: () => Promise<void> };

export async function createJobWorkers(jobs: Array<AnyJob>): Promise<Array<JobWorker>> {
  const jobsByQueue = new Map<string, Array<AnyJob>>();
  for (const job of jobs) {
    const { queue = DEFAULT_QUEUE } = job.config;
    if (jobsByQueue.has(queue)) {
      jobsByQueue.get(queue)?.push(job);
    } else {
      jobsByQueue.set(queue, [job]);
    }
  }

  const workers: Array<JobWorker> = [];
  for (const [queue, tasks] of jobsByQueue.entries()) {
    const worker = await createJobWorker(queue, tasks);
    workers.push(worker);
  }
  return workers;
}

async function createJobWorker(queue: string, jobs: Array<AnyJob>): Promise<JobWorker> {
  const connection = getRedisClient();

  const worker = new Worker(
    queue,
    async ({ name, data }) => {
      const job = jobs.find((job) => job.config.name === name);

      if (!job) throw new Error(`Job not found: "${name}"`);

      await job.config.run(data);
    },
    {
      connection,
      concurrency: 1,
      removeOnComplete: { count: 1000 },
      removeOnFail: { count: 1000 },
    },
  );

  // Schedule cron jobs
  for (const job of jobs) {
    if ('schedule' in job) {
      await job.schedule();
    }
  }

  worker.on('ready', () => {
    logger.info(`🚀 Jobs worker is ready for "${queue}" queue:`);
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
