import { db } from '../../libs/db';
import { InvitationNotFoundError } from '../../libs/errors';

export const getInvitation = async (invitationId: string) => {
  const invitation = await db.invite.findUnique({
    select: { type: true, talk: true, proposal: true, organization: true, invitedBy: true },
    where: { id: invitationId },
  });
  if (!invitation) {
    throw new InvitationNotFoundError();
  }
  return {
    type: invitation.type,
    title: invitation.talk?.title || invitation.proposal?.title || invitation.organization?.name || '',
    invitedBy: invitation.invitedBy.name || '',
  };
};
