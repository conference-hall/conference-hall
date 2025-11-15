import type { Event, Prisma } from '../../index.ts';
import { ConversationContextType, db } from '../../index.ts';

type FactoryOptions = {
  event: Event;
  proposalId?: string;
  attributes?: Partial<Prisma.ConversationCreateInput>;
};

export const conversationFactory = async (options: FactoryOptions) => {
  const { event, proposalId, attributes = {} } = options;

  const defaultAttributes: Prisma.ConversationCreateInput = {
    event: { connect: { id: event.id } },
    contextType: proposalId
      ? ConversationContextType.PROPOSAL_CONVERSATION
      : ConversationContextType.PROPOSAL_REVIEW_COMMENTS,
    contextIds: proposalId ? [proposalId] : [],
  };

  const data = { ...defaultAttributes, ...attributes };
  return db.conversation.create({ data });
};
