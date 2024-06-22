import type { JobsOptions } from 'bullmq';
import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { getEnv } from 'jobs/libs/env/env.ts';

import type { Email } from './email.payload';

const env = getEnv();

export class EmailQueue {
  private static instance: EmailQueue;
  private queue: Queue;

  private constructor() {
    const connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });
    this.queue = new Queue<Email>('default', {
      connection,
      defaultJobOptions: {
        attempts: 5,
        backoff: { type: 'exponential', delay: 3000 },
      },
    });
  }

  static get() {
    if (!this.instance) {
      this.instance = new EmailQueue();
    }
    return this.instance;
  }

  async enqueue(jobName: string, mail: Email, options?: JobsOptions) {
    return this.queue.add(jobName, mail, options);
  }

  async close() {
    await this.queue.close();
    await this.queue.disconnect();
  }
}
