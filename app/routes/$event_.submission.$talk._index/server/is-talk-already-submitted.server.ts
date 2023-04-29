import { db } from '../../../libs/db';

export async function isTalkAlreadySubmitted(slug: string, talkId: string, userId: string) {
  const proposal = await db.proposal.findFirst({
    where: {
      talk: { id: talkId },
      event: { slug },
      status: { not: 'DRAFT' },
      speakers: { some: { id: userId } },
    },
  });
  return Boolean(proposal);
}
