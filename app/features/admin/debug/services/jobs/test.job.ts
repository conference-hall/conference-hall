import { job } from '~/shared/jobs/job.ts';
import { logger } from '~/shared/jobs/logger.ts';
import { db } from '../../../../../../prisma/db.server.ts';

export const testJob = job<string>({
  name: 'test-job',
  run: async (_id) => {
    const total = await db.user.count();
    logger.info(`User count is ${total}.`);
  },
});
