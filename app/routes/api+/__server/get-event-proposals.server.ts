import { db } from '~/libs/db';
import { ApiKeyInvalidError, EventNotFoundError } from '~/libs/errors';
import { jsonToArray } from '~/libs/prisma';
import { EventProposalsSearch } from '~/routes/__server/proposals/EventProposalsSearch';
import type { ProposalsFilters } from '~/routes/__types/proposal';
import type { UserSocialLinks } from '~/routes/__types/user';
import { getLanguage } from '~/utils/languages';
import { getLevel } from '~/utils/levels';

export const getEventProposals = async (eventSlug: string, apiKey: string, filters: ProposalsFilters) => {
  const event = await db.event.findFirst({ where: { slug: eventSlug } });

  if (!event) throw new EventNotFoundError();

  if (event.apiKey !== apiKey) throw new ApiKeyInvalidError();

  const search = new EventProposalsSearch(eventSlug, 'no-user', filters);

  const proposals = await search.proposals({ reviews: false });

  return {
    name: event.name,
    proposals: proposals.map((proposal) => {
      return {
        title: proposal.title,
        abstract: proposal.abstract,
        level: getLevel(proposal.level),
        formats: proposal.formats.map((f) => f.name),
        categories: proposal.categories.map((c) => c.name),
        languages: jsonToArray(proposal.languages).map(getLanguage),
        speakers: proposal.speakers.map((speaker) => ({
          name: speaker.name,
          bio: speaker.bio,
          company: speaker.company,
          picture: speaker.picture,
          socials: speaker.socials as UserSocialLinks,
        })),
      };
    }),
  };
};
