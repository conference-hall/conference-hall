import closeWithGrace from 'close-with-grace';
import { createWorker } from './libs/tasks/task.ts';
import { sendEmail } from './tasks/send-email.job.ts';

const worker = createWorker([sendEmail]);

process.on('uncaughtException', (err) => {
  console.error('[Jobs] Uncaught exception', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(`[Jobs] Unhandled Rejection: ${reason}`, promise);
});

closeWithGrace(async () => {
  console.log('[Jobs] Shutting down the jobs worker server...');
  await worker.close();
});
