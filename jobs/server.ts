import { worker } from './email/email.worker';

worker.on('ready', () => console.log('Emails jobs worker is ready'));

worker.on('completed', (job) => console.log(`Completed job ${job.id} successfully`));

worker.on('failed', (job, err) => console.log(`Failed job ${job?.id} with ${err}`));

process.on('uncaughtException', function (err) {
  console.error(err, '[Jobs] Uncaught exception');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error({ promise, reason }, '[Jobs] Unhandled Rejection at: Promise');
});

const gracefulShutdown = async () => {
  console.log('Shutting down the jobs worker server...');
  await worker.close();
  await worker.disconnect();
  process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
