import type { TalkSaveData } from '~/schemas/talks';
import { db } from '../../../libs/db';

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
