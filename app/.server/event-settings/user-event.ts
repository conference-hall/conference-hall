import type { Prisma } from '@prisma/client';
import { db } from 'prisma/db.server.ts';
import { EventNotFoundError, ForbiddenOperationError } from '~/libs/errors.server.ts';
import { sortBy } from '~/libs/utils/arrays-sort-by.ts';
import type { EventEmailNotificationsKeys } from '~/types/events.types.ts';
import type { Permission } from '../team/user-permissions.ts';
import { UserPermissions } from '../team/user-permissions.ts';
import { EventGeneralSettingsSchema } from './user-event.types.ts';

export class UserEvent {
  constructor(
    public userId: string,
    public teamSlug: string,
    public eventSlug: string,
  ) {}

  static for(userId: string, teamSlug: string, eventSlug: string) {
    return new UserEvent(userId, teamSlug, eventSlug);
  }

  async needsPermission(permission: Permission) {
    const roles = UserPermissions.getRoleWith(permission);

    const event = await db.event.findFirst({
      where: {
        slug: this.eventSlug,
        team: { slug: this.teamSlug, members: { some: { memberId: this.userId, role: { in: roles } } } },
      },
    });
    if (!event) throw new ForbiddenOperationError();
    return event;
  }

  async get() {
    const event = await db.event.findFirst({
      include: { formats: true, categories: true, integrations: true, proposalTags: true },
      where: { slug: this.eventSlug, team: { slug: this.teamSlug, members: { some: { memberId: this.userId } } } },
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

  async buildGeneralSettingsSchema() {
    return EventGeneralSettingsSchema.refine(
      async ({ slug }) => {
        const count = await db.event.count({ where: { AND: [{ slug }, { slug: { not: this.eventSlug } }] } });
        return count === 0;
      },
      { message: 'This URL already exists.', path: ['slug'] },
    );
  }
}
