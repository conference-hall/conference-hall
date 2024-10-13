import type { Prisma } from '@prisma/client';
import { db } from 'prisma/db.server.ts';

import { EventNotFoundError, ForbiddenOperationError, SlugAlreadyExistsError } from '~/libs/errors.server.ts';
import type { EventEmailNotificationsKeys } from '~/types/events.types.ts';

import type { Permission } from '../team/user-permissions.ts';
import { UserPermissions } from '../team/user-permissions.ts';

export type EventData = Awaited<ReturnType<typeof UserEvent.prototype.get>>;

export class UserEvent {
  constructor(
    protected userId: string,
    protected teamSlug: string,
    protected eventSlug: string,
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
      include: { formats: true, categories: true, integrations: true },
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
      conferenceStart: event.conferenceStart?.toISOString(),
      conferenceEnd: event.conferenceEnd?.toISOString(),
      description: event.description,
      visibility: event.visibility,
      websiteUrl: event.websiteUrl,
      codeOfConductUrl: event.codeOfConductUrl,
      contactEmail: event.contactEmail,
      logoUrl: event.logoUrl,
      maxProposals: event.maxProposals,
      surveyEnabled: event.surveyEnabled,
      surveyQuestions: (event.surveyQuestions || []) as Array<string>,
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
      cfpStart: event.cfpStart?.toISOString(),
      cfpEnd: event.cfpEnd?.toISOString(),
      cfpState: event.cfpState,
      formats: event.formats.map(({ id, name, description }) => ({ id, name, description })),
      categories: event.categories.map(({ id, name, description }) => ({ id, name, description })),
      integrations: event.integrations.map((integration) => integration.name),
      archived: event.archived,
    };
  }

  async update(data: Partial<Prisma.EventCreateInput>) {
    const event = await this.needsPermission('canEditEvent');

    return db.$transaction(async (trx) => {
      if (data.slug) {
        const existSlug = await trx.event.findFirst({ where: { slug: data.slug, id: { not: event.id } } });
        if (existSlug) throw new SlugAlreadyExistsError();
      }
      return trx.event.update({ where: { id: event.id }, data: { ...data } });
    });
  }
}
