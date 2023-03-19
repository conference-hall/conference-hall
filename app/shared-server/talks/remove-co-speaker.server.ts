import { db } from '../../libs/db';
import { TalkNotFoundError } from '../../libs/errors';

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
