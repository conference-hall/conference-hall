import { ForbiddenOperationError } from '~/libs/errors.server.ts';
import { OpenPlanner, type OpenPlannerSessionsPayload } from '~/libs/integrations/open-planner.ts';
import { compactObject } from '~/libs/utils/object-compact.ts';
import type { TalkLanguages } from '~/types/proposals.types.ts';
import { EventIntegrations } from '../event-settings/event-integrations.ts';
import { UserEvent } from '../event-settings/user-event.ts';
import { ProposalSearchBuilder } from '../shared/proposal-search-builder.ts';
import type { ProposalsFilters } from '../shared/proposal-search-builder.types.ts';
import type { SocialLinks } from '../speaker-profile/speaker-profile.types.ts';
import { ReviewDetails } from './review-details.ts';

export class CfpReviewsExports {
  constructor(
    private userId: string,
    private userEvent: UserEvent,
  ) {}

  static for(userId: string, teamSlug: string, eventSlug: string) {
    const userEvent = UserEvent.for(userId, teamSlug, eventSlug);
    return new CfpReviewsExports(userId, userEvent);
  }

  async forJson(filters: ProposalsFilters) {
    const event = await this.userEvent.needsPermission('canExportEventProposals');

    const search = new ProposalSearchBuilder(event.slug, this.userId, filters, {
      withSpeakers: true,
      withReviews: true,
    });

    const proposals = await search.proposals({ reviews: true });

    return proposals.map((proposal) => {
      const reviews = new ReviewDetails(proposal.reviews);
      return {
        id: proposal.id,
        title: proposal.title,
        abstract: proposal.abstract,
        deliberationStatus: proposal.deliberationStatus,
        confirmationStatus: proposal.confirmationStatus,
        level: proposal.level,
        references: proposal.references,
        formats: proposal.formats,
        categories: proposal.categories,
        languages: proposal.languages,
        speakers: proposal.speakers.map((speaker) => ({
          name: speaker.name,
          bio: speaker.bio,
          company: speaker.company,
          references: speaker.references,
          picture: speaker.picture,
          location: speaker.location,
          email: speaker.email,
          socials: speaker.socials as SocialLinks,
        })),
        reviews: reviews.summary(),
      };
    });
  }

  async forCards(filters: ProposalsFilters) {
    const event = await this.userEvent.needsPermission('canExportEventProposals');

    const search = new ProposalSearchBuilder(event.slug, this.userId, filters, {
      withSpeakers: true,
      withReviews: true,
    });

    const proposals = await search.proposals({ reviews: true });

    return proposals.map((proposal) => {
      const reviews = new ReviewDetails(proposal.reviews);

      return {
        id: proposal.id,
        title: proposal.title,
        level: proposal.level,
        formats: proposal.formats,
        categories: proposal.categories,
        languages: proposal.languages as string[],
        speakers: proposal.speakers.map((speaker) => speaker.name),
        reviews: reviews.summary(),
      };
    });
  }

  // TODO: Do it in async with jobs
  async forOpenPlanner(filters: ProposalsFilters) {
    const event = await this.userEvent.needsPermission('canExportEventProposals');

    const { userId, teamSlug, eventSlug } = this.userEvent;
    const eventIntegrations = await EventIntegrations.for(userId, teamSlug, eventSlug);

    const openPlanner = await eventIntegrations.getConfiguration('OPEN_PLANNER');
    if (!openPlanner) throw new ForbiddenOperationError();

    const search = new ProposalSearchBuilder(event.slug, this.userId, filters, {
      withSpeakers: true,
      withReviews: false,
    });

    const proposals = await search.proposals();

    const payload = proposals.reduce<OpenPlannerSessionsPayload>(
      (result, proposal) => {
        // add sessions
        const format = proposal.formats?.at(0);
        const category = proposal.categories?.at(0);
        const languages = proposal.languages as TalkLanguages;

        result.sessions.push(
          compactObject({
            id: proposal.id,
            title: proposal.title,
            abstract: proposal.abstract,
            language: languages.at(0),
            level: proposal.level,
            speakerIds: proposal.speakers.map((s) => s.id),
            formatId: format?.id,
            formatName: format?.name,
            categoryId: category?.id,
            categoryName: category?.name,
          }),
        );

        // add speakers
        for (const speaker of proposal.speakers) {
          if (result.speakers.some((s) => s.id === speaker.id)) {
            continue;
          }

          // socials attribute is causing a bug during export
          // const socials = speaker.socials as SocialLinks;
          // const socialArray = [];
          // if (socials.github) socialArray.push({ name: 'GitHub', link: `https://github.com/${socials.github}` });
          // if (socials.twitter) socialArray.push({ name: 'X', link: `https://x.com/${socials.twitter}` });

          result.speakers.push(
            compactObject({
              id: speaker.id,
              name: speaker.name,
              bio: speaker.bio,
              company: speaker.company,
              photoUrl: speaker.picture,
              socials: [],
            }),
          );
        }

        return result;
      },
      { sessions: [], speakers: [] },
    );

    const { eventId, apiKey } = openPlanner.configuration;
    return OpenPlanner.postSessionsAndSpeakers(eventId, apiKey, payload);
  }
}
