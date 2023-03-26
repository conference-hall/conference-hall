import { ProposalStatus } from '@prisma/client';
import { db } from '../../../libs/db';
import { TalkNotFoundError } from '../../../libs/errors';

export async function deleteTalk(uid: string, talkId: string) {
  const talk = await db.talk.findFirst({
    where: { id: talkId, speakers: { some: { id: uid } } },
  });
  if (!talk) throw new TalkNotFoundError();

  await db.$transaction([
    db.proposal.deleteMany({ where: { talkId, status: ProposalStatus.DRAFT } }),
    db.talk.delete({ where: { id: talkId } }),
  ]);
}
