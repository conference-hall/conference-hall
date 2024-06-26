import { db } from 'prisma/db.server.ts';

import { EventNotFoundError } from '~/libs/errors.server.ts';

export type EventData = Awaited<ReturnType<typeof EventPage.prototype.get>>;

export class EventPage {
  constructor(private slug: string) {}

  static of(slug: string) {
    return new EventPage(slug);
  }

  async get() {
    const event = await db.event.findUnique({
      where: { slug: this.slug },
      include: { formats: true, categories: true, team: true },
    });

    if (!event) throw new EventNotFoundError();

    return {
      id: event.id,
      slug: event.slug,
      type: event.type,
      name: event.name,
      teamName: event.team.name,
      description: event.description,
      address: event.address,
      conferenceStart: event.conferenceStart?.toUTCString(),
      conferenceEnd: event.conferenceEnd?.toUTCString(),
      cfpStart: event.cfpStart?.toUTCString(),
      cfpEnd: event.cfpEnd?.toUTCString(),
      cfpState: event.cfpState,
      isCfpOpen: event.isCfpOpen,
      surveyEnabled: event.surveyEnabled,
      websiteUrl: event.websiteUrl,
      contactEmail: event.contactEmail,
      codeOfConductUrl: event.codeOfConductUrl,
      logo: event.logo,
      maxProposals: event.maxProposals,
      hasTracks: event.categories.length > 0 || event.formats.length > 0,
      formats: event.formats.map((f) => ({
        id: f.id,
        name: f.name,
        description: f.description,
      })),
      formatsRequired: event.formatsRequired,
      categories: event.categories.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
      })),
      categoriesRequired: event.categoriesRequired,
    };
  }
}