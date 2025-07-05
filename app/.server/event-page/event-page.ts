import { db } from 'prisma/db.server.ts';

import { z } from 'zod';
import { EventNotFoundError } from '~/shared/errors.server.ts';
import { TracksMandatorySchema, TracksOptionalSchema } from '../cfp-submission-funnel/talk-submission.types.ts';
import { SurveyConfig } from '../event-survey/survey-config.ts';

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

    const { isActiveForEvent } = new SurveyConfig(event.surveyConfig);

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
      websiteUrl: event.websiteUrl,
      contactEmail: event.contactEmail,
      codeOfConductUrl: event.codeOfConductUrl,
      logoUrl: event.logoUrl,
      maxProposals: event.maxProposals,
      hasSurvey: isActiveForEvent,
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

  async buildTracksSchema() {
    const { formatsRequired, categoriesRequired, formats, categories } = await this.get();
    return z.object({
      formats: formatsRequired && formats.length > 0 ? TracksMandatorySchema : TracksOptionalSchema,
      categories: categoriesRequired && categories.length > 0 ? TracksMandatorySchema : TracksOptionalSchema,
    });
  }

  static async getByLegacyId(legacyId: string) {
    const event = await db.event.findFirst({ where: { migrationId: legacyId } });
    if (!event) throw new EventNotFoundError();

    return event;
  }
}
