import { db } from 'prisma/db.server.ts';

import { EventNotFoundError, SurveyNotEnabledError } from '~/libs/errors.server.ts';

import { flags } from '~/libs/feature-flags/flags.server.ts';
import { defaultQuestions } from '../event-survey/models/default-survey-questions.ts';
import { SurveyConfig } from './models/survey-config.ts';
import type { SurveyData } from './types.ts';

// TODO: [survey] Add tests
export class SpeakerSurvey {
  constructor(private eventSlug: string) {}

  static for(eventSlug: string) {
    return new SpeakerSurvey(eventSlug);
  }

  async getQuestions() {
    const event = await db.event.findUnique({
      select: { id: true, surveyEnabled: true, surveyQuestions: true, surveyConfig: true },
      where: { slug: this.eventSlug },
    });
    if (!event) throw new EventNotFoundError();

    const newSurveyActive = await flags.get('custom-survey');

    // Legacy survey
    if (!newSurveyActive) {
      if (!event.surveyEnabled) throw new SurveyNotEnabledError();

      const enabledQuestions = event.surveyQuestions as string[];
      return defaultQuestions.filter((question) => enabledQuestions.includes(question.id));
    }

    const survey = new SurveyConfig(event.surveyConfig);
    if (!survey.isActiveForEvent) throw new SurveyNotEnabledError();

    return survey.questions;
  }

  // TODO: [survey] Build and test
  async buildValidationSchema() {
    const questions = await this.getQuestions();
    return questions;
  }

  async getSpeakerAnswers(speakerId: string) {
    const userSurvey = await db.survey.findFirst({
      select: { answers: true },
      where: { event: { slug: this.eventSlug }, user: { id: speakerId } },
    });

    return (userSurvey?.answers ?? {}) as SurveyData;
  }

  async getMultipleSpeakerAnswers(speakerIds: Array<string>) {
    const userSurveys = await db.survey.findMany({
      select: { userId: true, answers: true },
      where: { event: { slug: this.eventSlug }, userId: { in: speakerIds } },
    });

    return userSurveys.map((survey) => ({ userId: survey.userId, answers: survey.answers as SurveyData }));
  }

  async saveSpeakerAnswer(speakerId: string, answers: SurveyData) {
    const event = await db.event.findUnique({
      select: { id: true },
      where: { slug: this.eventSlug },
    });
    if (!event) throw new EventNotFoundError();

    await db.survey.upsert({
      where: { userId_eventId: { userId: speakerId, eventId: event.id } },
      create: { eventId: event.id, userId: speakerId, answers: answers },
      update: { answers },
    });
  }
}
