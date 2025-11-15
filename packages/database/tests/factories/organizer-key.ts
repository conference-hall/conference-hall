import type { Prisma } from '../../index.ts';
import { db } from '../../index.ts';

type FactoryOptions = {
  attributes?: Partial<Prisma.OrganizerKeyAccessCreateInput>;
};

export const organizerKeyFactory = (options: FactoryOptions = {}) => {
  const { attributes = {} } = options;

  return db.organizerKeyAccess.create({ data: attributes });
};
