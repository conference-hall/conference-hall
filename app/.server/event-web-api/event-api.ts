import { db } from 'prisma/db.server.ts';

import { ApiKeyInvalidError, EventNotFoundError } from '~/libs/errors.server.ts';

import { ProposalSearchBuilder } from '../shared/proposal-search-builder.ts';
import type { ProposalsFilters } from '../shared/proposal-search-builder.types.ts';
import type { SocialLinks } from '../speaker-profile/speaker-profile.types.ts';

export class EventApi {
  constructor(
    private eventSlug: string,
    private apiKey: string,
  ) {}

  async proposals(filters: ProposalsFilters) {
    const event = await db.event.findFirst({ where: { slug: this.eventSlug } });

    if (!event) throw new EventNotFoundError();

    if (event.apiKey !== this.apiKey) throw new ApiKeyInvalidError();

    const search = new ProposalSearchBuilder(this.eventSlug, 'no-user', filters);

    const proposals = await search.proposals({ reviews: false });

    return {
      name: event.name,
      proposals: proposals.map((proposal) => {
        return {
          title: proposal.title,
          abstract: proposal.abstract,
          level: proposal.level,
          formats: proposal.formats.map((f) => f.name),
          categories: proposal.categories.map((c) => c.name),
          languages: proposal.languages as string[],
          speakers: proposal.speakers.map((speaker) => ({
            name: speaker.name,
            bio: speaker.bio,
            company: speaker.company,
            picture: speaker.picture,
            socials: speaker.socials as SocialLinks,
          })),
        };
      }),
    };
  }
}
