import { type Job, Queue, Worker } from 'bullmq';
import Redis from 'ioredis';
import { getEnv } from 'jobs/libs/env/env.ts';

const env = getEnv();

export type TaskConfig<TaskPayload> = {
  id: string;
  run: (payload: TaskPayload) => Promise<void>;
};

export type Task<TaskPayload> = {
  config: TaskConfig<TaskPayload>;
  trigger: (payload: TaskPayload) => Promise<void>;
};

// TODO: Improve logging
// TODO: Move queue config in task definition
const DEFAULT_QUEUE = 'default';

const queues = new Map<string, Queue<unknown>>();

export function task<TaskPayload>(config: TaskConfig<TaskPayload>): Task<TaskPayload> {
  console.log('!!!!!!!!!!!!!!!! BUILD TASK');
  return {
    config,
    trigger: async (payload: TaskPayload) => {
      if (!queues.has(DEFAULT_QUEUE)) {
        // Create the queue connection
        const connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });
        queues.set(
          DEFAULT_QUEUE,
          new Queue<TaskPayload>(DEFAULT_QUEUE, {
            connection,
            defaultJobOptions: {
              attempts: 5,
              backoff: { type: 'exponential', delay: 3000 },
            },
          }),
        );
      }

      // Trigger the job
      const queue = queues.get(DEFAULT_QUEUE);
      await queue?.add(config.id, payload);
    },
  };
}

export function createWorker(tasks: Array<Task<any>>) {
  const connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });

  const tasksProcessor = async (job: Job<unknown>) => {
    const task = tasks.find((task) => task.config.id === job.name);
    if (!task) {
      console.error(`Task not found for name: ${job.name}`);
      return;
    }
    await task.config.run(job.data);
  };

  const worker = new Worker(DEFAULT_QUEUE, tasksProcessor, {
    connection: connection,
    concurrency: 1,
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 1000 },
  });

  worker.on('ready', () => {
    console.log(`Jobs worker is ready for "${DEFAULT_QUEUE}" queue.`);
    for (const task of tasks) {
      console.log(` - "${task.config.id}" job registered.`);
    }
  });

  worker.on('completed', (job) => {
    console.log(`Completed job "${job.name}". Job ID: ${job.id}`);
  });

  worker.on('failed', (job, err) => {
    console.error(`Failed job "${job?.name}". Job ID: ${job?.id}. Error: ${err}`);
  });

  return {
    queue: DEFAULT_QUEUE,
    close: async () => {
      await worker.close();
      await worker.disconnect();
    },
  };
}
