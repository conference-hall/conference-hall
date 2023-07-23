import { db } from '~/libs/db';
import type { TalkSaveData } from '~/schemas/talks';

export async function createTalk(userId: string, data: TalkSaveData) {
  const result = await db.talk.create({
    data: {
      ...data,
      creator: { connect: { id: userId } },
      speakers: { connect: [{ id: userId }] },
    },
  });
  return result.id;
}