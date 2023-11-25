import { db } from '~/libs/db';
import { EventNotFoundError } from '~/libs/errors';

export class EventSubmissionSettings {
  constructor(private slug: string) {}

  static for(slug: string) {
    return new EventSubmissionSettings(slug);
  }

  async hasSurvey() {
    const settings = await db.event.findUnique({ select: { surveyEnabled: true }, where: { slug: this.slug } });

    if (!settings) throw new EventNotFoundError();

    return settings.surveyEnabled;
  }

  async hasTracks() {
    const settings = await db.event.findUnique({
      select: { _count: { select: { categories: true, formats: true } } },
      where: { slug: this.slug },
    });

    if (!settings) throw new EventNotFoundError();

    return settings._count.categories > 0 || settings._count.formats > 0;
  }

  async tracksRequired() {
    const settings = await db.event.findUnique({
      select: { formatsRequired: true, categoriesRequired: true },
      where: { slug: this.slug },
    });

    if (!settings) throw new EventNotFoundError();

    return settings;
  }
}
