import { db } from '../../prisma/db.server.ts';
import type { Event } from '../../prisma/generated/client.ts';
import { ConversationContextType } from '../../prisma/generated/client.ts';
import type { ConversationCreateInput } from '../../prisma/generated/models.ts';

type FactoryOptions = {
  event: Event;
  proposalId?: string;
  attributes?: Partial<ConversationCreateInput>;
};

export const conversationFactory = async (options: FactoryOptions) => {
  const { event, proposalId, attributes = {} } = options;

  const defaultAttributes: ConversationCreateInput = {
    event: { connect: { id: event.id } },
    contextType: proposalId
      ? ConversationContextType.PROPOSAL_CONVERSATION
      : ConversationContextType.PROPOSAL_REVIEW_COMMENTS,
    contextIds: proposalId ? [proposalId] : [],
  };

  const data = { ...defaultAttributes, ...attributes };
  return db.conversation.create({ data });
};
