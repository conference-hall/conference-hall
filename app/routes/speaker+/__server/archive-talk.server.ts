import { db } from '~/libs/db.ts';
import { TalkNotFoundError } from '~/libs/errors.ts';

export async function archiveTalk(userId: string, talkId: string) {
  const talk = await db.talk.findFirst({
    where: { id: talkId, speakers: { some: { id: userId } } },
  });
  if (!talk) throw new TalkNotFoundError();

  await db.talk.update({ where: { id: talkId }, data: { archived: true } });
}

export async function restoreTalk(userId: string, talkId: string) {
  const talk = await db.talk.findFirst({
    where: { id: talkId, speakers: { some: { id: userId } } },
  });
  if (!talk) throw new TalkNotFoundError();

  await db.talk.update({ where: { id: talkId }, data: { archived: false } });
}
