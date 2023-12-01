import { Queue } from 'bullmq';
import Redis from 'ioredis';

import { config } from '~/libs/config';

export class JobQueue extends Queue {
  static queues: Map<string, JobQueue> = new Map();

  private constructor(queueName: string) {
    console.log(`!!!!!!!!!!!! QUEUE ${queueName} CREATED !!!!!!!!!!!!!`);
    const connection = new Redis(config.REDIS_PRIVATE_URL, { maxRetriesPerRequest: null });
    super(queueName, { connection });
  }

  static get(queueName: string = 'default') {
    let queue = this.queues.get(queueName);
    if (!queue) {
      queue = new JobQueue(queueName);
      this.queues.set(queueName, queue);
    }
    return queue;
  }

  static async close() {
    await Promise.all([...this.queues.values()].map((queue) => queue.close()));
  }
}
