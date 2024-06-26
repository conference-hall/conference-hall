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

  async answers() {
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

// TODO Add tests
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
      where: { event: { slug: this.eventSlug }, user: { id: { in: this.userIds } } },
    });

    return userSurveys.map((survey) => ({ userId: survey.userId, answers: survey.answers as SurveyData }));
  }
}