import type { AuthorizedEvent } from '~/shared/authorization/types.ts';
import type { EventEmailNotificationsKeys } from '~/shared/types/events.types.ts';
import { EventNotFoundError } from '~/shared/errors.server.ts';
import { sortBy } from '~/shared/utils/arrays-sort-by.ts';
import { db } from '../../../../prisma/db.server.ts';

export class EventFetcher {
  constructor(private authorizedEvent: AuthorizedEvent) {}

  static for(authorizedEvent: AuthorizedEvent) {
    return new EventFetcher(authorizedEvent);
  }

  async get() {
    const { teamId, event } = this.authorizedEvent;

    const fullEvent = await db.event.findFirst({
      include: {
        integrations: true,
        proposalTags: true,
        formats: { orderBy: { order: 'asc' } },
        categories: { orderBy: { order: 'asc' } },
      },
      where: { id: event.id, teamId },
    });
    if (!fullEvent) throw new EventNotFoundError();

    return {
      id: fullEvent.id,
      name: fullEvent.name,
      slug: fullEvent.slug,
      type: fullEvent.type,
      location: fullEvent.location,
      onlineEvent: fullEvent.onlineEvent,
      timezone: fullEvent.timezone,
      conferenceStart: fullEvent.conferenceStart,
      conferenceEnd: fullEvent.conferenceEnd,
      description: fullEvent.description,
      visibility: fullEvent.visibility,
      websiteUrl: fullEvent.websiteUrl,
      codeOfConductUrl: fullEvent.codeOfConductUrl,
      contactEmail: fullEvent.contactEmail,
      logoUrl: fullEvent.logoUrl,
      maxProposals: fullEvent.maxProposals,
      reviewEnabled: fullEvent.reviewEnabled,
      displayProposalsReviews: fullEvent.displayProposalsReviews,
      displayProposalsSpeakers: fullEvent.displayProposalsSpeakers,
      speakersConversationEnabled: fullEvent.speakersConversationEnabled,
      formatsRequired: fullEvent.formatsRequired,
      formatsAllowMultiple: fullEvent.formatsAllowMultiple,
      categoriesRequired: fullEvent.categoriesRequired,
      categoriesAllowMultiple: fullEvent.categoriesAllowMultiple,
      languageEnabled: fullEvent.languageEnabled,
      emailOrganizer: fullEvent.emailOrganizer,
      emailNotifications: (fullEvent.emailNotifications || []) as EventEmailNotificationsKeys,
      slackWebhookUrl: fullEvent.slackWebhookUrl,
      apiKey: fullEvent.apiKey,
      cfpStart: fullEvent.cfpStart,
      cfpEnd: fullEvent.cfpEnd,
      cfpState: fullEvent.cfpState,
      formats: fullEvent.formats.map(({ id, name, description }) => ({ id, name, description })),
      categories: fullEvent.categories.map(({ id, name, description }) => ({ id, name, description })),
      integrations: fullEvent.integrations.map((integration) => integration.name),
      archived: fullEvent.archived,
      tags: sortBy(
        fullEvent.proposalTags.map((tag) => ({ id: tag.id, name: tag.name, color: tag.color })),
        'name',
      ),
    };
  }
}
