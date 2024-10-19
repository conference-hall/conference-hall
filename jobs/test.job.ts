import { db } from 'prisma/db.server.ts';
import { job } from './libs/job.ts';
import { logger } from './libs/logger/logger.ts';

export const testJob = job<string>({
  name: 'test-job',
  run: async (id) => {
    const total = await db.user.count();
    logger.info(`User count is ${total}.`);
  },
});
