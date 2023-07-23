import { MessageChannel } from '@prisma/client';

import { db } from '~/libs/db';
import { allowedForEvent } from '~/server/teams/check-user-role.server';

export async function getProposalMessages(eventSlug: string, proposalId: string, userId: string) {
  await allowedForEvent(eventSlug, userId);

  const messages = await db.message.findMany({ where: { proposalId }, include: { user: true } });

  return messages
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .map((message) => ({
      id: message.id,
      userId: message.userId,
      name: message.user.name,
      picture: message.user.picture,
      message: message.message,
    }));
}

export async function addProposalMessage(eventSlug: string, proposalId: string, userId: string, message: string) {
  await allowedForEvent(eventSlug, userId);

  await db.message.create({
    data: { userId: userId, proposalId, message, channel: MessageChannel.ORGANIZER },
  });
}

export async function removeProposalMessage(eventSlug: string, proposalId: string, userId: string, messageId: string) {
  await allowedForEvent(eventSlug, userId);

  await db.message.deleteMany({ where: { id: messageId, userId: userId, proposalId } });
}
