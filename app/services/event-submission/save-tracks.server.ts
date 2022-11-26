import type { TrackUpdateData } from '~/schemas/tracks';
import { db } from '../../libs/db';
import { ProposalNotFoundError } from '../../libs/errors';

export async function saveTracks(talkId: string, eventId: string, uid: string, data: TrackUpdateData) {
  const proposal = await db.proposal.findFirst({
    select: { id: true },
    where: { talkId, eventId, speakers: { some: { id: uid } } },
  });
  if (!proposal) throw new ProposalNotFoundError();

  await db.proposal.update({
    where: { id: proposal.id },
    data: {
      formats: { set: [], connect: data.formats?.map((f) => ({ id: f })) },
      categories: {
        set: [],
        connect: data.categories?.map((c) => ({ id: c })),
      },
    },
  });
}
