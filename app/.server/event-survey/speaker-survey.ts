import { db } from 'prisma/db.server.ts';

import { EventNotFoundError, SurveyNotEnabledError } from '~/libs/errors.server.ts';

import type { Event } from '@prisma/client';
import { z } from 'zod';
import { flags } from '~/libs/feature-flags/flags.server.ts';
import { defaultQuestions } from '../event-survey/models/default-survey-questions.ts';
import { SurveyConfig } from './models/survey-config.ts';
import type { SurveyDetailedAnswer, SurveyQuestion, SurveyRawAnswers } from './types.ts';

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

  async buildSurveySchema() {
    const questions = await this.getQuestions();

    const schema = questions.reduce<z.ZodRawShape>((schema, question) => {
      if (question.type === 'checkbox') {
        schema[question.id] = question.required
          ? z.array(z.string().trim()).nonempty()
          : z.array(z.string().trim()).nullable().optional();
      } else {
        schema[question.id] = question.required
          ? z.string().trim().max(500).min(1)
          : z.string().trim().max(500).nullable().optional().default(null);
      }
      return schema;
    }, {});

    return z.object(schema);
  }

  async saveSpeakerAnswer(speakerId: string, answers: SurveyRawAnswers) {
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

  async getSpeakerAnswers(speakerId: string) {
    const userSurvey = await db.survey.findFirst({
      select: { answers: true },
      where: { event: { slug: this.eventSlug }, user: { id: speakerId } },
    });

    return (userSurvey?.answers ?? {}) as SurveyRawAnswers;
  }

  async getMultipleSpeakerAnswers(event: Event, speakerIds: Array<string>) {
    let questions: Array<SurveyQuestion>;

    const newSurveyActive = await flags.get('custom-survey');
    if (!newSurveyActive) {
      const enabledQuestions = (event.surveyQuestions as string[]) || [];
      questions = defaultQuestions.filter((question) => enabledQuestions.includes(question.id));
    } else {
      const survey = new SurveyConfig(event.surveyConfig);
      questions = survey.questions;
    }

    const userSurveys = await db.survey.findMany({
      select: { userId: true, answers: true },
      where: { event: { slug: this.eventSlug }, userId: { in: speakerIds } },
    });

    return userSurveys.reduce<Record<string, Array<SurveyDetailedAnswer>>>((acc, userSurvey) => {
      const answers = (userSurvey.answers ?? {}) as SurveyRawAnswers;
      acc[userSurvey.userId] = this.mapSurveyDetailedAnswers(questions, answers);
      return acc;
    }, {});
  }

  private mapSurveyDetailedAnswers(
    questions: Array<SurveyQuestion>,
    answers: SurveyRawAnswers,
  ): Array<SurveyDetailedAnswer> {
    const mapOption = (question: SurveyQuestion, answer: string[]) => {
      return question.options?.filter((option) => answer.includes(option.id)) || [];
    };

    return questions
      .filter((question) => Boolean(answers[question.id]))
      .map((question) => {
        const answer = answers[question.id];

        if (question.type === 'text') {
          return {
            id: question.id,
            label: question.label,
            type: 'text',
            answer: typeof answer === 'string' ? answer : null,
          };
        }

        if (question.type === 'radio') {
          return {
            id: question.id,
            label: question.label,
            type: 'radio',
            answers: typeof answer === 'string' ? mapOption(question, [answer]) : [],
          };
        }

        return {
          id: question.id,
          label: question.label,
          type: 'checkbox',
          answers: Array.isArray(answer) ? mapOption(question, answer) : [],
        };
      });
  }
}
