import { db } from '~/libs/db';
import { EventNotFoundError } from '~/libs/errors';

import type { SurveyData } from './SpeakerAnswers.types';

export class SpeakerAnswers {
  constructor(
    private userId: string,
    private eventSlug: string,
  ) {}

  static for(userId: string, eventSlug: string) {
    return new SpeakerAnswers(userId, eventSlug);
  }

  async answers() {
    const userSurvey = await db.survey.findFirst({
      select: { answers: true },
      where: { event: { slug: this.eventSlug }, user: { id: this.userId } },
    });

    return (userSurvey?.answers ?? {}) as Record<string, unknown>;
  }

  async save(answers: SurveyData) {
    const event = await db.event.findUnique({
      select: { id: true },
      where: { slug: this.eventSlug },
    });
    if (!event) throw new EventNotFoundError();

    await db.survey.upsert({
      where: { userId_eventId: { eventId: event.id, userId: this.userId } },
      update: { answers },
      create: {
        event: { connect: { id: event.id } },
        user: { connect: { id: this.userId } },
        answers: answers,
      },
    });
  }
}
