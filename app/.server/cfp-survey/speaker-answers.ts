import { db } from 'prisma/db.server.ts';

import { EventNotFoundError } from '~/libs/errors.server.ts';

import type { SurveyData } from './speaker-answers.types';

export class SpeakerAnswers {
  constructor(
    private userId: string,
    private eventSlug: string,
  ) {}

  static for(userId: string, eventSlug: string) {
    return new SpeakerAnswers(userId, eventSlug);
  }

  async getAnswers() {
    const userSurvey = await db.survey.findFirst({
      select: { answers: true },
      where: { event: { slug: this.eventSlug }, user: { id: this.userId } },
    });

    return (userSurvey?.answers ?? {}) as SurveyData;
  }

  async save(answers: SurveyData) {
    const event = await db.event.findUnique({
      select: { id: true },
      where: { slug: this.eventSlug },
    });
    if (!event) throw new EventNotFoundError();

    await db.survey.upsert({
      where: { userId_eventId: { userId: this.userId, eventId: event.id } },
      create: { eventId: event.id, userId: this.userId, answers: answers },
      update: { answers },
    });
  }
}

export class SpeakersAnswers {
  constructor(
    private userIds: Array<string>,
    private eventSlug: string,
  ) {}

  static for(userIds: Array<string>, eventSlug: string) {
    return new SpeakersAnswers(userIds, eventSlug);
  }

  async getAnswers() {
    const userSurveys = await db.survey.findMany({
      select: { userId: true, answers: true },
      where: { event: { slug: this.eventSlug }, userId: { in: this.userIds } },
    });

    return userSurveys.map((survey) => ({ userId: survey.userId, answers: survey.answers as SurveyData }));
  }
}
