import { db } from '~/libs/db';
import { InvitationInvalidOrAccepted, InvitationNotFoundError } from '~/libs/errors';

export async function checkTalkInviteCode(code: string) {
  const talk = await db.talk.findUnique({ where: { invitationCode: code } });

  if (!talk) throw new InvitationNotFoundError();

  return { id: talk.id, title: talk.title };
}

export async function addCoSpeakerToTalk(code: string, coSpeakerId: string) {
  const talk = await checkTalkInviteCode(code);

  try {
    await db.talk.update({
      where: { id: talk.id },
      data: { speakers: { connect: { id: coSpeakerId } } },
    });
  } catch (e) {
    throw new InvitationInvalidOrAccepted();
  }

  return { id: talk.id };
}
