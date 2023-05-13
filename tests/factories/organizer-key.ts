import type { Prisma } from '@prisma/client';

import { db } from '../../app/libs/db';

type FactoryOptions = {
  attributes?: Partial<Prisma.OrganizerKeyAccessCreateInput>;
};

export const organizerKeyFactory = (options: FactoryOptions = {}) => {
  const { attributes = {} } = options;

  return db.organizerKeyAccess.create({ data: attributes });
};
