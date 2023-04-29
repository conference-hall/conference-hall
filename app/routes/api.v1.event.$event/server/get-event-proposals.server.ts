import { db } from '../../../libs/db';
import { ApiKeyInvalidError, EventNotFoundError } from '../../../libs/errors';

export const getEventProposals = async (eventSlug: string, apiKey: string) => {
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
        picture: speaker.picture,
        github: speaker.github,
        twitter: speaker.twitter,
      })),
    };
  });
};
