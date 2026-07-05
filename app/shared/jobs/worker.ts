import { Worker } from 'bullmq';
import { logger, runWithLogger } from '~/shared/logger/logger.server.ts';
import { getRedisClient } from '../cache/redis.server.ts';
import type { Job } from './job.ts';

export const DEFAULT_QUEUE = 'default';

type JobWorker = { queue: string; close: () => Promise<void> };

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

  const jobLogContext = (job?: { id?: string; name?: string }) => ({ jobId: job?.id, jobName: job?.name, queue });

  const worker = new Worker(
    queue,
    async ({ id, name, data }) => {
      const job = jobs.find((job) => job.config.name === name);

      if (!job) throw new Error(`Job not found: "${name}"`);

      const jobLogger = logger.child(jobLogContext({ id, name }));
      await runWithLogger(jobLogger, () => job.config.run(data));
    },
    {
      connection,
      concurrency: 1,
      removeOnComplete: { count: 1000 },
      removeOnFail: { count: 1000 },
    },
  );

  worker.on('ready', () => {
    logger.info({ queue, jobs: jobs.map((job) => job.config.name) }, '🚀 Jobs worker is ready');
  });

  worker.on('completed', (job) => {
    logger.info(jobLogContext(job), 'Job completed');
  });

  worker.on('failed', (job, error) => {
    logger.error({ error, ...jobLogContext(job) }, 'Job failed');
  });

  return {
    queue,
    close: async () => {
      await worker.close();
      await worker.disconnect();
    },
  };
}
