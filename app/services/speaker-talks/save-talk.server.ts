import type { TalkSaveData } from '~/schemas/talks';
import { db } from '../../libs/db';
import { TalkNotFoundError } from '../../libs/errors';

// TODO merge create and update talk?
export async function createTalk(uid: string, data: TalkSaveData) {
  const result = await db.talk.create({
    data: {
      ...data,
      creator: { connect: { id: uid } },
      speakers: { connect: [{ id: uid }] },
    },
  });
  return result.id;
}

export async function updateTalk(uid: string, talkId?: string, data?: TalkSaveData) {
  const talk = await db.talk.findFirst({
    where: { id: talkId, speakers: { some: { id: uid } } },
  });
  if (!talk || !data) throw new TalkNotFoundError();

  await db.talk.update({
    where: { id: talkId },
    data,
  });
}
