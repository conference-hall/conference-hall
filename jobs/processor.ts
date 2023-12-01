import type { Job } from 'bullmq';

import { JobQueue } from './queues';

export interface Processor {
  queueName: string;
  jobName: string;
  onProcess(job: Job): Promise<void>;
  onFailed(job: Job | undefined, err: Error): Promise<void>;
  onCompleted(job: Job): Promise<void>;
}

export abstract class JobProcessor<T> implements Processor {
  queueName = 'default';

  abstract jobName: string;

  abstract process(payload: T): Promise<void>;

  async onProcess(job: Job<T>) {
    await this.process(job.data);
  }

  async onCompleted(job: Job<T>) {
    console.log(`${job?.id} has completed!`);
  }

  async onFailed(job: Job<T>, err: Error) {
    console.log(`${job?.id} has failed with ${job.failedReason}: ${err.message}`);
  }

  async trigger(payload: T) {
    await JobQueue.get().add(this.jobName, payload, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
    });
  }

  async triggerNow(payload: T) {
    await this.process(payload);
  }
}
