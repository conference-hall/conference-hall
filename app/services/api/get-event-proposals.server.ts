import { makeDomainFunction } from 'domain-functions';
import { z } from 'zod';
import { db } from '../db';
import { ApiKeyInvalidError, EventNotFoundError } from '../errors';

export const EventProposalsApiSchema = z.object({
  eventSlug: z.string().min(1),
  apiKey: z.string().min(1),
});

export const getEventProposals = makeDomainFunction(EventProposalsApiSchema)(async ({ eventSlug, apiKey }) => {
  const event = await db.event.findFirst({ where: { slug: eventSlug } });

  if (!event) throw new EventNotFoundError();
  if (event.apiKey !== apiKey) throw new ApiKeyInvalidError();

  const proposals = await db.proposal.findMany({
    include: { speakers: true, categories: true, formats: true },
  });

  return proposals.map((proposal) => {
    return {
      id: proposal.id,
      title: proposal.title,
      abstract: proposal.abstract,
      level: proposal.level,
      formats: proposal.formats,
      categories: proposal.categories,
      languages: proposal.languages,
      speakers: proposal.speakers.map((speaker) => ({
        name: speaker.name,
        bio: speaker.bio,
        company: speaker.company,
        photoURL: speaker.photoURL,
        github: speaker.github,
        twitter: speaker.twitter,
      })),
    };
  });
});
