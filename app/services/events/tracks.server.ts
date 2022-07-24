import { z } from 'zod';
import { db } from '../db';
import { ProposalNotFoundError } from '../errors';

export type ProposalTracks = {
  formats: string[];
  categories: string[];
};

export async function getProposalTracks(talkId: string, eventId: string, uid: string): Promise<ProposalTracks> {
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

export async function saveTracks(talkId: string, eventId: string, uid: string, data: TrackData): Promise<void> {
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

type TrackData = z.infer<typeof TracksSchema>;

const TracksSchema = z.object({
  formats: z.array(z.string()),
  categories: z.array(z.string()),
});

export function validateTracksForm(form: FormData) {
  return TracksSchema.safeParse({
    formats: form.getAll('formats'),
    categories: form.getAll('categories'),
  });
}
