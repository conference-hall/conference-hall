import { db } from '../../prisma/db.server.ts';
import type { Event } from '../../prisma/generated/client.ts';
import { ConversationType } from '../../prisma/generated/client.ts';
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
    type: proposalId ? ConversationType.PROPOSAL_SPEAKER_CONVERSATION : ConversationType.PROPOSAL_REVIEW_COMMENTS,
    proposal: proposalId ? { connect: { id: proposalId } } : undefined,
  };

  const data = { ...defaultAttributes, ...attributes };
  return db.conversation.create({ data });
};
