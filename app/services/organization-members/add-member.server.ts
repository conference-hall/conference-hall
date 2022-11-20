import { db } from '../db';
import { InvitationNotFoundError } from '../errors';

export async function addMember(invitationId: string, memberId: string) {
  const invitation = await db.invite.findUnique({
    select: { type: true, organization: true, invitedBy: true },
    where: { id: invitationId },
  });
  if (!invitation || invitation.type !== 'ORGANIZATION' || !invitation.organization) {
    throw new InvitationNotFoundError();
  }

  await db.organizationMember.create({
    data: { memberId, organizationId: invitation.organization.id },
  });

  return { slug: invitation.organization.slug };
}
