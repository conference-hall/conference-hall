import { Prisma } from '@prisma/client';
import { db } from '../../app/services/db';

type FactoryOptions = {
  attributes: Prisma.InviteCreateInput;
};

export const inviteFactory = (options: FactoryOptions) => {
  return db.invite.create({ data: options.attributes });
}
