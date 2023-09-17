import { db } from '~/libs/db.ts';
import { TalkNotFoundError } from '~/libs/errors.ts';
import type { TalkSaveData } from '~/routes/__types/talks.ts';

export async function updateTalk(userId: string, talkId: string, data?: TalkSaveData) {
  const talk = await db.talk.findFirst({
    where: { id: talkId, speakers: { some: { id: userId } } },
  });
  if (!talk || !data) throw new TalkNotFoundError();

  await db.talk.update({
    where: { id: talkId },
    data,
  });
}
