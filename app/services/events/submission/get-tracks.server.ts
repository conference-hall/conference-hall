import { makeDomainFunction } from 'domain-functions';
import { z } from 'zod';
import { db } from '~/services/db';
import { ProposalNotFoundError } from '~/services/errors';

const Schema = z.object({
  talkId: z.string().min(1),
  eventSlug: z.string().min(1),
  speakerId: z.string().min(1),
});

export const getSubmissionTracks = makeDomainFunction(Schema)(async ({ talkId, eventSlug, speakerId }) => {
  const proposal = await db.proposal.findFirst({
    select: { formats: true, categories: true },
    where: { talkId, event: { slug: eventSlug }, speakers: { some: { id: speakerId } } },
  });

  if (!proposal) throw new ProposalNotFoundError();

  return {
    formats: proposal.formats.map((f) => f.id),
    categories: proposal.categories.map((c) => c.id),
  };
});
