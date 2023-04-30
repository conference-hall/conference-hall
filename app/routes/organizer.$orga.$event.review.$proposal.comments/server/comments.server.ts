import { MessageChannel } from '@prisma/client';
import { db } from '~/libs/db';
import { allowedForEvent } from '~/shared-server/organizations/check-user-role.server';

export async function addProposalComment(eventSlug: string, proposalId: string, userId: string, message: string) {
  await allowedForEvent(eventSlug, userId);

  await db.message.create({
    data: { userId: userId, proposalId, message, channel: MessageChannel.ORGANIZER },
  });
}

export async function removeProposalComment(eventSlug: string, proposalId: string, userId: string, messageId: string) {
  await allowedForEvent(eventSlug, userId);

  await db.message.deleteMany({ where: { id: messageId, userId: userId, proposalId } });
}
