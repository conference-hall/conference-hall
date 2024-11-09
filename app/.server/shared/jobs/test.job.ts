import { db } from 'prisma/db.server.ts';
import { job } from '~/libs/jobs/job.ts';
import { logger } from '../../../libs/jobs/logger.ts';

export const testJob = job<string>({
  name: 'test-job',
  run: async (_id) => {
    const total = await db.user.count();
    logger.info(`User count is ${total}.`);
  },
});
