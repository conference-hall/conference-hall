import closeWithGrace from 'close-with-grace';

import { worker } from './email/email.worker.ts';

worker.on('ready', () => console.log('Emails jobs worker is ready'));

worker.on('completed', (job) => console.log(`Completed job ${job.id} successfully`));

worker.on('failed', (job, err) => console.log(`Failed job ${job?.id} with ${err}`));

process.on('uncaughtException', function (err) {
  console.error(err, '[Jobs] Uncaught exception');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error({ promise, reason }, '[Jobs] Unhandled Rejection at: Promise');
});

closeWithGrace(async () => {
  console.log('Shutting down the jobs worker server...');
  await worker.close();
  await worker.disconnect();
});
