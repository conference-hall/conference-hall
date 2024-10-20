import closeWithGrace from 'close-with-grace';

import { sendEmail } from '../app/.server/shared/jobs/send-email.job.ts';
import { testJob } from '../app/.server/shared/jobs/test.job.ts';
import { logger } from '../app/libs/jobs/logger.ts';
import { createJobWorkers } from '../app/libs/jobs/worker.ts';

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
