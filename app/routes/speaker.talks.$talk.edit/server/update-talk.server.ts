import type { TalkSaveData } from '~/schemas/talks';
import { db } from '../../../libs/db';
import { TalkNotFoundError } from '../../../libs/errors';

export async function updateTalk(uid: string, talkId: string, data?: TalkSaveData) {
  const talk = await db.talk.findFirst({
    where: { id: talkId, speakers: { some: { id: uid } } },
  });
  if (!talk || !data) throw new TalkNotFoundError();

  await db.talk.update({
    where: { id: talkId },
    data,
  });
}
