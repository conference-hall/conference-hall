import { db } from '@conference-hall/database';
import { notifyConversationMessage } from '~/features/conversations/services/jobs/notify-conversation-message.job.ts';
import { exportToOpenPlanner } from '~/features/event-management/proposals-export/services/jobs/export-to-open-planner.job.ts';
import { sendTalkToSlack } from '~/features/event-participation/cfp-submission/services/send-talk-to-slack.job.ts';
import { sendEmail } from '~/shared/emails/send-email.job.ts';
import { createJobWorkers } from '~/shared/jobs/worker.ts';
import { testJob } from '../app/features/admin/debug/services/jobs/test.job.ts';
import { logger } from '../app/shared/jobs/logger.ts';

const jobs = [sendEmail, exportToOpenPlanner, sendTalkToSlack, notifyConversationMessage, testJob];

const workers = createJobWorkers(jobs);

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', err);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection: ${reason}`, promise);
});

// Setup graceful shutdown
let isShuttingDown = false;

const gracefulShutdown = async (signal: string) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  const timeout = setTimeout(() => {
    logger.error('❌ Graceful shutdown timed out, forcing exit');
    process.exit(1);
  }, 10000);

  try {
    logger.info(`🔥 Shutting down jobs server (${signal})`);
    for (const worker of workers) {
      await worker.close();
    }
    await db.$disconnect();
    clearTimeout(timeout);
    process.exit(0);
  } catch (error) {
    logger.error(`❌ Error during graceful shutdown: ${error}`);
    clearTimeout(timeout);
    process.exit(1);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
