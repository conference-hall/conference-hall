import { db } from '../../../libs/db';
import { InvitationNotFoundError } from '../../../libs/errors';

export async function addCoSpeakerToTalk(invitationId: string, coSpeakerId: string) {
  const invitation = await db.invite.findUnique({
    select: { type: true, talk: true, organization: true, invitedBy: true },
    where: { id: invitationId },
  });
  if (!invitation || invitation.type !== 'TALK' || !invitation.talk) {
    throw new InvitationNotFoundError();
  }

  const talk = await db.talk.update({
    data: { speakers: { connect: { id: coSpeakerId } } },
    where: { id: invitation.talk.id },
  });
  return { id: talk.id };
}
