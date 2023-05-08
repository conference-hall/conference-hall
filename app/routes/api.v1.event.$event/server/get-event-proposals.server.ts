import { db } from '~/libs/db';
import { ApiKeyInvalidError, EventNotFoundError } from '~/libs/errors';
import { jsonToArray } from '~/libs/prisma';
import type { ProposalsFilters } from '~/schemas/proposal';
import type { UserSocialLinks } from '~/schemas/user';
import { OrganizerProposalsSearch } from '~/shared-server/proposals/OrganizerProposalsSearch';
import { getLanguage } from '~/utils/languages';
import { getLevel } from '~/utils/levels';

export const getEventProposals = async (eventSlug: string, apiKey: string, filters: ProposalsFilters) => {
  const event = await db.event.findFirst({ where: { slug: eventSlug } });

  if (!event) throw new EventNotFoundError();

  if (event.apiKey !== apiKey) throw new ApiKeyInvalidError();

  const search = new OrganizerProposalsSearch(eventSlug, 'no-user', filters);

  const proposals = await search.proposals({ ratings: false });

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
