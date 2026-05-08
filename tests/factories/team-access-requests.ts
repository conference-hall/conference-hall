import { randCompanyName, randEmail } from '@ngneat/falso';
import { db } from '../../prisma/db.server.ts';
import type { TeamAccessRequestCreateInput } from '../../prisma/generated/models.ts';

type FactoryOptions = {
  attributes?: Partial<TeamAccessRequestCreateInput>;
};

export const teamAccessRequestFactory = (options: FactoryOptions = {}) => {
  const { attributes = {} } = options;

  const defaultAttributes: TeamAccessRequestCreateInput = {
    eventName: randCompanyName(),
    email: randEmail(),
  };

  return db.teamAccessRequest.create({ data: { ...defaultAttributes, ...attributes } });
};
