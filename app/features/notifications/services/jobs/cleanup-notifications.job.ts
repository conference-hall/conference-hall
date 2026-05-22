import { job } from '~/shared/jobs/job.ts';
import { db } from '../../../../../prisma/db.server.ts';

const RETENTION_DAYS = 90;

export const cleanupNotifications = job<undefined>({
  name: 'cleanup-notifications',
  queue: 'default',
  run: async () => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);

    await db.notification.deleteMany({
      where: { read: true, createdAt: { lt: cutoffDate } },
    });
  },
});
