import type { Prisma, TeamRole } from '@prisma/client';
import { db } from 'prisma/db.server.ts';

import { EventNotFoundError, ForbiddenOperationError, SlugAlreadyExistsError } from '~/libs/errors.server.ts';
import { geocode } from '~/libs/geocode/geocode.server.ts';
import type { EventEmailNotificationsKeys } from '~/types/events.types.ts';
import type { QuestionKeys } from '~/types/survey.types';

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

  async allowedFor(roles: TeamRole[]) {
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
      include: { formats: true, categories: true },
      where: { slug: this.eventSlug, team: { slug: this.teamSlug, members: { some: { memberId: this.userId } } } },
    });
    if (!event) throw new EventNotFoundError();

    return {
      id: event.id,
      name: event.name,
      slug: event.slug,
      type: event.type,
      address: event.address,
      timezone: event.timezone,
      conferenceStart: event.conferenceStart?.toISOString(),
      conferenceEnd: event.conferenceEnd?.toISOString(),
      description: event.description,
      visibility: event.visibility,
      websiteUrl: event.websiteUrl,
      codeOfConductUrl: event.codeOfConductUrl,
      contactEmail: event.contactEmail,
      logo: event.logo,
      maxProposals: event.maxProposals,
      surveyEnabled: event.surveyEnabled,
      surveyQuestions: (event.surveyQuestions || []) as QuestionKeys,
      reviewEnabled: event.reviewEnabled,
      displayProposalsReviews: event.displayProposalsReviews,
      displayProposalsSpeakers: event.displayProposalsSpeakers,
      formatsRequired: event.formatsRequired,
      categoriesRequired: event.categoriesRequired,
      emailOrganizer: event.emailOrganizer,
      emailNotifications: (event.emailNotifications || []) as EventEmailNotificationsKeys,
      slackWebhookUrl: event.slackWebhookUrl,
      apiKey: event.apiKey,
      cfpStart: event.cfpStart?.toISOString(),
      cfpEnd: event.cfpEnd?.toISOString(),
      cfpState: event.cfpState,
      formats: event.formats.map(({ id, name, description }) => ({ id, name, description })),
      categories: event.categories.map(({ id, name, description }) => ({ id, name, description })),
      archived: event.archived,
    };
  }

  async update(data: Partial<Prisma.EventCreateInput>) {
    const event = await this.allowedFor(['OWNER']);

    if (data.address && event?.address !== data.address) {
      const geocodedAddress = await geocode(data.address);
      data.address = geocodedAddress.address;
      data.lat = geocodedAddress.lat;
      data.lng = geocodedAddress.lng;
    }

    return db.$transaction(async (trx) => {
      if (data.slug) {
        const existSlug = await trx.event.findFirst({ where: { slug: data.slug, id: { not: event.id } } });
        if (existSlug) throw new SlugAlreadyExistsError();
      }
      return trx.event.update({ where: { id: event.id }, data: { ...data } });
    });
  }
}
