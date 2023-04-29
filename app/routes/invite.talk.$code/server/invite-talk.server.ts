import { db } from '~/libs/db';

export async function checkTalkInviteCode(code: string) {
  const talk = await db.talk.findUnique({ where: { invitationCode: code } });

  if (!talk) return null;

  return { id: talk.id, title: talk.title };
}

export async function addCoSpeakerToTalk(code: string, coSpeakerId: string) {
  const talk = await checkTalkInviteCode(code);
  if (!talk) return null;

  await db.talk.update({
    where: { id: talk.id },
    data: { speakers: { connect: { id: coSpeakerId } } },
  });

  return { id: talk.id };
}
