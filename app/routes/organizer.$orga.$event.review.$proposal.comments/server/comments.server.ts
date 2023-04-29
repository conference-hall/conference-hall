import { MessageChannel } from '@prisma/client';
import { db } from '../../../libs/db';
import { checkUserRole } from '~/shared-server/organizations/check-user-role.server';

export async function addProposalComment(
  orgaSlug: string,
  eventSlug: string,
  proposalId: string,
  userId: string,
  message: string
) {
  await checkUserRole(orgaSlug, eventSlug, userId);

  await db.message.create({
    data: { userId: userId, proposalId, message, channel: MessageChannel.ORGANIZER },
  });
}

export async function removeProposalComment(
  orgaSlug: string,
  eventSlug: string,
  proposalId: string,
  userId: string,
  messageId: string
) {
  await checkUserRole(orgaSlug, eventSlug, userId);

  await db.message.deleteMany({ where: { id: messageId, userId: userId, proposalId } });
}
