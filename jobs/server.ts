import { AcceptedProposalEmailJob } from './emails/AcceptedProposalEmailJob';
import { createWorker } from './workers';

const worker = createWorker('default', [new AcceptedProposalEmailJob()]);

process.on('uncaughtException', function (err) {
  console.error(err, '[Jobs] Uncaught exception');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error({ promise, reason }, '[Jobs] Unhandled Rejection at: Promise');
});

const gracefulShutdown = async () => {
  console.log('Shutting down the jobs worker server...');
  await worker.close();
  process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
