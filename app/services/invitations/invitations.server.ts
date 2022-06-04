import { db } from '../db';

export type Invitation = {
  type: 'SPEAKER' | 'ORGANIZATION';
  title: string;
  invitedBy: string;
}

/**
 * Get invitation data from an invitation id
 * @param invitationId Id of the invitation
 * @returns Invitation data
 */
export const getInvitation = async (invitationId: string): Promise<Invitation> => {
  const invitation = await db.invite.findUnique({
    select: { type: true, talk: true, organization: true, invitedBy: true },
    where: { id: invitationId },
  });
  if (!invitation) {
    throw new InvitationFoundError();
  }
  return {
    type: invitation.type,
    title: invitation.talk?.title || '',
    invitedBy: invitation.invitedBy.name || '',
  };
};

export class InvitationFoundError extends Error {
  constructor() {
    super('Invitation not found');
    this.name = 'InvitationFoundError';
  }
}
