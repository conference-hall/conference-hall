import { db } from 'prisma/db.server.ts';

import { ApiKeyInvalidError, EventNotFoundError } from '~/libs/errors.server.ts';

import { ReviewDetails } from '../reviews/review-details.ts';
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

    const proposals = await search.proposals();

    return {
      name: event.name,
      startDate: event.conferenceStart,
      endDate: event.conferenceEnd,
      proposals: proposals.map((proposal) => {
        const reviews = new ReviewDetails(proposal.reviews);

        return {
          id: proposal.id,
          title: proposal.title,
          abstract: proposal.abstract,
          deliberationStatus: proposal.deliberationStatus,
          confirmationStatus: proposal.confirmationStatus,
          publicationStatus: proposal.publicationStatus,
          level: proposal.level,
          references: proposal.references,
          formats: proposal.formats.map((f) => f.name),
          categories: proposal.categories.map((c) => c.name),
          tags: proposal.tags.map((tag) => tag.name),
          languages: proposal.languages as string[],
          speakers: proposal.newSpeakers.map((speaker) => ({
            name: speaker.name,
            bio: speaker.bio,
            company: speaker.company,
            references: speaker.references,
            picture: speaker.picture,
            location: speaker.location,
            socialLinks: speaker.socialLinks as SocialLinks,
          })),
          review: reviews.summary(),
        };
      }),
    };
  }
}
