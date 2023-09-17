import { db } from '~/libs/db.ts';
import type { TalkSaveData } from '~/routes/__types/talks.ts';

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
