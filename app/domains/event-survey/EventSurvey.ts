import { db } from '~/libs/db';
import { EventNotFoundError, SurveyNotEnabledError } from '~/libs/errors';

import { questions } from './SurveyQuestions';

export class EventSurvey {
  constructor(private eventSlug: string) {}

  static of(eventSlug: string) {
    return new EventSurvey(eventSlug);
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
