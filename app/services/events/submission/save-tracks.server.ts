import { makeDomainFunction } from 'domain-functions';
import { z } from 'zod';
import { repeatable } from 'zod-form-data';
import { db } from '~/services/db';
import { ProposalNotFoundError } from '~/services/errors';

const Schema = z.object({
  talkId: z.string().min(1),
  eventSlug: z.string().min(1),
  speakerId: z.string().min(1),
  data: z.object({
    formats: repeatable(z.array(z.string().trim())).optional(),
    categories: repeatable(z.array(z.string().trim())).optional(),
  }),
});

export const saveSubmissionTracks = makeDomainFunction(Schema)(async ({ talkId, eventSlug, speakerId, data }) => {
  const proposal = await db.proposal.findFirst({
    select: { id: true },
    where: { talkId, event: { slug: eventSlug }, speakers: { some: { id: speakerId } } },
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
});
