import { db } from '../db';
import { InvitationNotFoundError, TalkNotFoundError } from '../errors';

/**
 * Invite a co-speaker to a talk
 * @param invitationId Id of the invitation
 * @param coSpeakerId Id of the co-speaker to add
 */
export async function inviteCoSpeakerToTalk(invitationId: string, coSpeakerId: string) {
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

/**
 * Remove a co-speaker from a talk
 * @param uid Id of the connected user
 * @param talkId Id of the talk
 * @param coSpeakerId Id of the co-speaker to remove
 */
export async function removeCoSpeakerFromTalk(uid: string, talkId: string, coSpeakerId: string) {
  const talk = await db.talk.findFirst({
    where: { id: talkId, speakers: { some: { id: uid } } },
  });
  if (!talk) throw new TalkNotFoundError();

  await db.talk.update({
    where: { id: talkId },
    data: { speakers: { disconnect: { id: coSpeakerId } } },
  });
}

/**
 * Archive a talk
 * @param uid Id of the connected user
 * @param talkId Id of the talk
 */
export async function archiveTalk(uid: string, talkId: string) {
  const talk = await db.talk.findFirst({
    where: { id: talkId, speakers: { some: { id: uid } } },
  });
  if (!talk) throw new TalkNotFoundError();

  await db.talk.update({ where: { id: talkId }, data: { archived: true } });
}

/**
 * Restore an archived talk
 * @param uid Id of the connected user
 * @param talkId Id of the talk
 */
export async function restoreTalk(uid: string, talkId: string) {
  const talk = await db.talk.findFirst({
    where: { id: talkId, speakers: { some: { id: uid } } },
  });
  if (!talk) throw new TalkNotFoundError();

  await db.talk.update({ where: { id: talkId }, data: { archived: false } });
}
