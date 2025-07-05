import type { Prisma } from '@prisma/client';
import { db } from 'prisma/db.server.ts';
import { EventNotFoundError } from '~/shared/errors.server.ts';
import type { EventEmailNotificationsKeys } from '~/shared/types/events.types.ts';
import { UserEventAuthorization } from '~/shared/user/user-event-authorization.server.ts';
import { sortBy } from '~/shared/utils/arrays-sort-by.ts';
import { EventGeneralSettingsSchema } from './event-settings.schema.server.ts';

export class EventSettings extends UserEventAuthorization {
  static for(userId: string, teamSlug: string, eventSlug: string) {
    return new EventSettings(userId, teamSlug, eventSlug);
  }

  // todo(folders): where to put this file?
  async get() {
    const event = await db.event.findFirst({
      include: { formats: true, categories: true, integrations: true, proposalTags: true },
      where: { slug: this.event, team: { slug: this.team, members: { some: { memberId: this.userId } } } },
    });
    if (!event) throw new EventNotFoundError();

    return {
      id: event.id,
      name: event.name,
      slug: event.slug,
      type: event.type,
      location: event.location,
      onlineEvent: event.onlineEvent,
      timezone: event.timezone,
      conferenceStart: event.conferenceStart,
      conferenceEnd: event.conferenceEnd,
      description: event.description,
      visibility: event.visibility,
      websiteUrl: event.websiteUrl,
      codeOfConductUrl: event.codeOfConductUrl,
      contactEmail: event.contactEmail,
      logoUrl: event.logoUrl,
      maxProposals: event.maxProposals,
      reviewEnabled: event.reviewEnabled,
      displayProposalsReviews: event.displayProposalsReviews,
      displayProposalsSpeakers: event.displayProposalsSpeakers,
      formatsRequired: event.formatsRequired,
      formatsAllowMultiple: event.formatsAllowMultiple,
      categoriesRequired: event.categoriesRequired,
      categoriesAllowMultiple: event.categoriesAllowMultiple,
      emailOrganizer: event.emailOrganizer,
      emailNotifications: (event.emailNotifications || []) as EventEmailNotificationsKeys,
      slackWebhookUrl: event.slackWebhookUrl,
      apiKey: event.apiKey,
      cfpStart: event.cfpStart,
      cfpEnd: event.cfpEnd,
      cfpState: event.cfpState,
      formats: event.formats.map(({ id, name, description }) => ({ id, name, description })),
      categories: event.categories.map(({ id, name, description }) => ({ id, name, description })),
      integrations: event.integrations.map((integration) => integration.name),
      archived: event.archived,
      tags: sortBy(
        event.proposalTags.map((tag) => ({ id: tag.id, name: tag.name, color: tag.color })),
        'name',
      ),
    };
  }

  async update(data: Partial<Prisma.EventCreateInput>) {
    const event = await this.needsPermission('canEditEvent');
    return db.event.update({ where: { id: event.id }, data: { ...data } });
  }

  async delete() {
    const event = await this.needsPermission('canDeleteEvent');
    return db.event.delete({ where: { id: event.id } });
  }

  async buildGeneralSettingsSchema() {
    return EventGeneralSettingsSchema.refine(
      async ({ slug }) => {
        const count = await db.event.count({ where: { AND: [{ slug }, { slug: { not: this.event } }] } });
        return count === 0;
      },
      { message: 'This URL already exists.', path: ['slug'] },
    );
  }
}
