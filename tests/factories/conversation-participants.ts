import { db } from '../../prisma/db.server.ts';
import type { Conversation, User } from '../../prisma/generated/client.ts';
import { ConversationParticipantRole } from '../../prisma/generated/client.ts';
import type { ConversationParticipantCreateInput } from '../../prisma/generated/models.ts';

type FactoryOptions = {
  conversation: Conversation;
  user: User;
  role?: ConversationParticipantRole;
  attributes?: Partial<ConversationParticipantCreateInput>;
};

export const conversationParticipantFactory = async (options: FactoryOptions) => {
  const { conversation, user, role = ConversationParticipantRole.SPEAKER, attributes = {} } = options;

  const defaultAttributes: ConversationParticipantCreateInput = {
    conversation: { connect: { id: conversation.id } },
    user: { connect: { id: user.id } },
    role,
  };

  const data = { ...defaultAttributes, ...attributes };
  return db.conversationParticipant.upsert({
    where: { conversationId_userId: { conversationId: conversation.id, userId: user.id } },
    create: data,
    update: data,
  });
};
