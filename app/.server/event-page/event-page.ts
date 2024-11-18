import { db } from 'prisma/db.server.ts';

import { EventNotFoundError } from '~/libs/errors.server.ts';
import { flags } from '~/libs/feature-flags/flags.server.ts';
import { SurveyConfig } from '../event-survey/models/survey-config.ts';

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

    const newSurveyActive = await flags.get('custom-survey');
    const surveyEnabled = newSurveyActive ? new SurveyConfig(event.surveyConfig).isActiveForEvent : event.surveyEnabled;

    return {
      id: event.id,
      slug: event.slug,
      type: event.type,
      name: event.name,
      teamName: event.team.name,
      description: event.description,
      onlineEvent: event.onlineEvent,
      location: event.location,
      timezone: event.timezone,
      conferenceStart: event.conferenceStart,
      conferenceEnd: event.conferenceEnd,
      cfpStart: event.cfpStart,
      cfpEnd: event.cfpEnd,
      cfpState: event.cfpState,
      isCfpOpen: event.isCfpOpen,
      surveyEnabled: surveyEnabled,
      websiteUrl: event.websiteUrl,
      contactEmail: event.contactEmail,
      codeOfConductUrl: event.codeOfConductUrl,
      logoUrl: event.logoUrl,
      maxProposals: event.maxProposals,
      hasTracks: event.categories.length > 0 || event.formats.length > 0,
      formats: event.formats.map((f) => ({
        id: f.id,
        name: f.name,
        description: f.description,
      })),
      formatsRequired: event.formatsRequired,
      formatsAllowMultiple: event.formatsAllowMultiple,
      categories: event.categories.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
      })),
      categoriesRequired: event.categoriesRequired,
      categoriesAllowMultiple: event.categoriesAllowMultiple,
    };
  }
}
