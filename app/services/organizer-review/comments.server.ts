import { MessageChannel } from '@prisma/client';
import { db } from '../../libs/db';
import { checkAccess } from '../organizer-event/check-access.server';

export async function addProposalComment(
  orgaSlug: string,
  eventSlug: string,
  proposalId: string,
  uid: string,
  message: string
) {
  await checkAccess(orgaSlug, eventSlug, uid);

  await db.message.create({
    data: { userId: uid, proposalId, message, channel: MessageChannel.ORGANIZER },
  });
}

export async function removeProposalComment(
  orgaSlug: string,
  eventSlug: string,
  proposalId: string,
  uid: string,
  messageId: string
) {
  await checkAccess(orgaSlug, eventSlug, uid);

  await db.message.deleteMany({ where: { id: messageId, userId: uid, proposalId } });
}
