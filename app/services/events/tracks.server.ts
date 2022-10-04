import type { TrackUpdateData } from '~/schemas/tracks';
import { db } from '../db';
import { ProposalNotFoundError } from '../errors';

export async function getProposalTracks(talkId: string, eventId: string, uid: string) {
  const proposal = await db.proposal.findFirst({
    select: { formats: true, categories: true },
    where: { talkId, eventId, speakers: { some: { id: uid } } },
  });
  if (!proposal) throw new ProposalNotFoundError();

  return {
    formats: proposal.formats.map((f) => f.id),
    categories: proposal.categories.map((c) => c.id),
  };
}

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
