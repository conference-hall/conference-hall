import type { Conversation, User } from 'prisma/generated/client.ts';
import type { ConversationMessageCreateInput } from 'prisma/generated/models.ts';
import { randParagraph } from '@ngneat/falso';
import { ConversationMessageType, ConversationParticipantRole } from 'prisma/generated/client.ts';
import { db } from '../../prisma/db.server.ts';

type Trait = 'withReaction';

type FactoryOptions = {
  conversation: Conversation;
  sender?: User;
  role?: ConversationParticipantRole;
  attributes?: Partial<ConversationMessageCreateInput>;
  traits?: Array<Trait>;
};

export const conversationMessageFactory = async (options: FactoryOptions) => {
  const { conversation, sender, role = ConversationParticipantRole.ORGANIZER, attributes = {}, traits = [] } = options;

  if (sender) {
    await db.conversationParticipant.upsert({
      where: { conversationId_userId: { conversationId: conversation.id, userId: sender.id } },
      create: { conversationId: conversation.id, userId: sender.id, role },
      update: {},
    });
  }

  const defaultAttributes: ConversationMessageCreateInput = {
    conversation: { connect: { id: conversation.id } },
    sender: sender ? { connect: { id: sender.id } } : undefined,
    content: randParagraph(),
    type: ConversationMessageType.TEXT,
  };

  const data = { ...defaultAttributes, ...attributes };
  const message = await db.conversationMessage.create({ data });

  if (traits.includes('withReaction') && sender) {
    await db.conversationReaction.create({
      data: { code: 'tada', messageId: message.id, userId: sender.id },
    });
  }

  return message;
};
