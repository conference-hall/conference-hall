import closeWithGrace from 'close-with-grace';
import { logger } from './libs/logger/logger.ts';
import { createJobWorkers } from './libs/worker.ts';
import { sendEmail } from './send-email.job.ts';
import { testJob } from './test.job.ts';

const jobs = [sendEmail, testJob];

const workers = createJobWorkers(jobs);

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', err);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection: ${reason}`, promise);
});

closeWithGrace(async () => {
  for (const worker of workers) {
    logger.info(`Shutting down the jobs worker for queue "${worker.queue}"`);
    await worker.close();
  }
});
