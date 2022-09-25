import type { Prisma, Proposal, User } from '@prisma/client';
import { MessageChannel } from '@prisma/client';
import { db } from '../../app/services/db';

type FactoryOptions = {
  user: User;
  proposal: Proposal;
  attributes?: Partial<Prisma.MessageCreateInput>;
};

export const messageFactory = (options: FactoryOptions) => {
  const { attributes = {}, user, proposal } = options;

  const defaultAttributes: Prisma.MessageCreateInput = {
    user: { connect: { id: user.id } },
    proposal: { connect: { id: proposal.id } },
    message: 'My message',
    channel: MessageChannel.ORGANIZER,
  };

  const data = { ...defaultAttributes, ...attributes };
  return db.message.create({ data });
};
