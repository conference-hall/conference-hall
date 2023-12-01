import type { Job } from 'bullmq';
import { Worker } from 'bullmq';
import Redis from 'ioredis';

import { config } from '~/libs/config';

import type { Processor } from './processor';

export function createWorker(name: string, jobProcessors: Processor[]) {
  const processors = new Processors(jobProcessors);
  const onProcess = processors.onProcess.bind(processors);
  const onCompeted = processors.onCompeted.bind(processors);
  const onFailed = processors.onFailed.bind(processors);

  console.log(`!!!!!!!!!!!! WORKER ${name} CREATED !!!!!!!!!!!!!`);

  const connection = new Redis(config.REDIS_URL, { maxRetriesPerRequest: null });

  const worker = new Worker(name, onProcess, {
    connection,
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 1000 },
  });

  worker.on('completed', onCompeted);

  worker.on('failed', onFailed);

  worker.on('ready', () => {
    console.log('[Jobs] emails jobs worker is ready');
  });

  return worker;
}

class Processors {
  processors: Processor[];

  constructor(processors: Processor[]) {
    this.processors = processors;
  }

  async onProcess(job: Job) {
    const processor = this.getProcessor(job.name);
    if (!processor) throw new Error(`Processor for job ${job.name} not found`);
    return processor.onProcess(job);
  }

  async onCompeted(job: Job) {
    const processor = this.getProcessor(job.name);
    return processor?.onCompleted(job);
  }

  async onFailed(job: Job | undefined, err: Error) {
    if (!job) throw new Error(err.message);
    const processor = this.getProcessor(job.name);
    return processor?.onFailed(job, err);
  }

  getProcessor(name: string) {
    return this.processors.find((processor) => processor.jobName === name);
  }
}
