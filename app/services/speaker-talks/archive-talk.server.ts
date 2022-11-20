import { db } from '../db';
import { TalkNotFoundError } from '../errors';

export async function archiveTalk(uid: string, talkId: string) {
  const talk = await db.talk.findFirst({
    where: { id: talkId, speakers: { some: { id: uid } } },
  });
  if (!talk) throw new TalkNotFoundError();

  await db.talk.update({ where: { id: talkId }, data: { archived: true } });
}

export async function restoreTalk(uid: string, talkId: string) {
  const talk = await db.talk.findFirst({
    where: { id: talkId, speakers: { some: { id: uid } } },
  });
  if (!talk) throw new TalkNotFoundError();

  await db.talk.update({ where: { id: talkId }, data: { archived: false } });
}
