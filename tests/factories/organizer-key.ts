import type { OrganizerKeyAccessCreateInput } from 'prisma/generated/models.ts';
import { db } from '../../prisma/db.server.ts';

type FactoryOptions = {
  attributes?: Partial<OrganizerKeyAccessCreateInput>;
};

export const organizerKeyFactory = (options: FactoryOptions = {}) => {
  const { attributes = {} } = options;

  return db.organizerKeyAccess.create({ data: attributes });
};
