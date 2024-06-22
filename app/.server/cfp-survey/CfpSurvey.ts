import { db } from 'prisma/db.server.ts';

import { EventNotFoundError, SurveyNotEnabledError } from '~/libs/errors.server.ts';

import { questions } from './SurveyQuestions.ts';

export class CfpSurvey {
  constructor(private eventSlug: string) {}

  static of(eventSlug: string) {
    return new CfpSurvey(eventSlug);
  }

  async questions() {
    const event = await db.event.findUnique({
      select: { id: true, surveyEnabled: true, surveyQuestions: true },
      where: { slug: this.eventSlug },
    });
    if (!event) throw new EventNotFoundError();

    if (!event.surveyEnabled) throw new SurveyNotEnabledError();

    const enabledQuestions = event.surveyQuestions as string[];
    return questions.filter((question) => enabledQuestions.includes(question.name));
  }
}
