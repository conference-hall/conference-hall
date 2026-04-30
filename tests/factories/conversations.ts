import { db } from '../../prisma/db.server.ts';
import type { ConversationType, Event } from '../../prisma/generated/client.ts';
import type { ConversationCreateInput } from '../../prisma/generated/models.ts';

type FactoryOptions = {
  event: Event;
  proposalId: string;
  type: ConversationType;
  attributes?: Partial<Omit<ConversationCreateInput, 'type'>>;
};

export const conversationFactory = async (options: FactoryOptions) => {
  const { event, proposalId, type, attributes = {} } = options;

  const defaultAttributes: ConversationCreateInput = {
    event: { connect: { id: event.id } },
    type,
    proposal: { connect: { id: proposalId } },
  };

  const data = { ...defaultAttributes, ...attributes };
  return db.conversation.create({ data });
};
