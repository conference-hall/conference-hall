import { ProposalSearchBuilder } from '~/domains/organizer-cfp-reviews/proposal-search-builder/ProposalSearchBuilder';
import { db } from '~/libs/db.ts';
import { ApiKeyInvalidError, EventNotFoundError } from '~/libs/errors.ts';
import { jsonToArray } from '~/libs/prisma.ts';
import type { ProposalsFilters } from '~/routes/__types/proposal.ts';
import type { UserSocialLinks } from '~/routes/__types/user.ts';
import { getLanguage } from '~/utils/languages.ts';
import { getLevel } from '~/utils/levels.ts';

export const getEventProposals = async (eventSlug: string, apiKey: string, filters: ProposalsFilters) => {
  const event = await db.event.findFirst({ where: { slug: eventSlug } });

  if (!event) throw new EventNotFoundError();

  if (event.apiKey !== apiKey) throw new ApiKeyInvalidError();

  const search = new ProposalSearchBuilder(eventSlug, 'no-user', filters);

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
