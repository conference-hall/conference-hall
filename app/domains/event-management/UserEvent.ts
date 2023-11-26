import type { Prisma, TeamRole } from '@prisma/client';

import { db } from '~/libs/db';
import { EventNotFoundError, ForbiddenOperationError, SlugAlreadyExistsError } from '~/libs/errors';
import { geocode } from '~/libs/geocode/geocode';
import { jsonToArray } from '~/libs/prisma';
import { getCfpState } from '~/utils/event';

export type EventData = Awaited<ReturnType<typeof UserEvent.prototype.get>>;

export class UserEvent {
  constructor(
    private userId: string,
    private teamSlug: string,
    private eventSlug: string,
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
      conferenceStart: event.conferenceStart?.toUTCString(),
      conferenceEnd: event.conferenceEnd?.toUTCString(),
      description: event.description,
      visibility: event.visibility,
      websiteUrl: event.websiteUrl,
      codeOfConductUrl: event.codeOfConductUrl,
      contactEmail: event.contactEmail,
      logo: event.logo,
      maxProposals: event.maxProposals,
      surveyEnabled: event.surveyEnabled,
      surveyQuestions: jsonToArray(event.surveyQuestions),
      reviewEnabled: event.reviewEnabled,
      displayProposalsReviews: event.displayProposalsReviews,
      displayProposalsSpeakers: event.displayProposalsSpeakers,
      formatsRequired: event.formatsRequired,
      categoriesRequired: event.categoriesRequired,
      emailOrganizer: event.emailOrganizer,
      emailNotifications: jsonToArray(event.emailNotifications),
      slackWebhookUrl: event.slackWebhookUrl,
      apiKey: event.apiKey,
      cfpStart: event.cfpStart?.toUTCString(),
      cfpEnd: event.cfpEnd?.toUTCString(),
      cfpState: getCfpState(event.type, event.cfpStart, event.cfpEnd),
      formats: event.formats.map(({ id, name, description }) => ({ id, name, description })),
      categories: event.categories.map(({ id, name, description }) => ({ id, name, description })),
      archived: event.archived,
    };
  }

  async update(data: Partial<Prisma.EventCreateInput>) {
    await this.allowedFor(['OWNER']);

    const event = await db.event.findFirst({ where: { slug: this.eventSlug } });
    if (!event) throw new EventNotFoundError();

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
