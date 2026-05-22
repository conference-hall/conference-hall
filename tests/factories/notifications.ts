import { db } from '../../prisma/db.server.ts';
import type { Event, Proposal, User } from '../../prisma/generated/client.ts';
import type { NotificationCreateInput } from '../../prisma/generated/models.ts';

type FactoryOptions = {
  user: User;
  event: Event;
  proposal: Proposal;
  attributes?: Partial<NotificationCreateInput>;
};

export const notificationFactory = async (options: FactoryOptions) => {
  const { attributes = {}, user, event, proposal } = options;

  const defaultAttributes: NotificationCreateInput = {
    type: 'PROPOSAL_ACCEPTED',
    user: { connect: { id: user.id } },
    event: { connect: { id: event.id } },
    proposal: { connect: { id: proposal.id } },
  };

  const data = { ...defaultAttributes, ...attributes };

  return db.notification.create({ data });
};
