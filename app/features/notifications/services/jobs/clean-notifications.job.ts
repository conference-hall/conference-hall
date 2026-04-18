import { logger } from '~/shared/logger/logger.server.ts';
import { db } from '../../../../../prisma/db.server.ts';
import { cronJob } from '../../../../shared/jobs/job.ts';

const RETENTION_DAYS = 90;

export const cleanNotifications = cronJob({
  name: 'clean-notifications',
  queue: 'default',
  cron: '0 3 * * *',
  run: async () => {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - RETENTION_DAYS);

    const { count } = await db.notification.deleteMany({
      where: { createdAt: { lt: threshold } },
    });

    if (count > 0) {
      logger.info(`Cleaned ${count} notifications older than ${RETENTION_DAYS} days`);
    }
  },
});
