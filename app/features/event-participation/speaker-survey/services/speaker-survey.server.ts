import { z } from 'zod';
import { SurveyConfig } from '~/features/event-management/settings/models/survey-config.ts';
import { EventNotFoundError, SurveyNotEnabledError } from '~/shared/errors.server.ts';
import type { SurveyDetailedAnswer, SurveyQuestion } from '~/shared/types/survey.types.ts';
import { db } from '../../../../../prisma/db.server.ts';
import type { Event } from '../../../../../prisma/generated/client.ts';

type SurveyRawAnswers = Record<string, string | string[] | null>;

export class SpeakerSurvey {
  constructor(private eventSlug: string) {}

  static for(eventSlug: string) {
    return new SpeakerSurvey(eventSlug);
  }

  async getQuestions() {
    const event = await db.event.findUnique({
      select: { id: true, surveyConfig: true },
      where: { slug: this.eventSlug },
    });
    if (!event) throw new EventNotFoundError();

    const survey = new SurveyConfig(event.surveyConfig);
    if (!survey.isActiveForEvent) throw new SurveyNotEnabledError();

    return survey.questions;
  }

  async buildSurveySchema() {
    const questions = await this.getQuestions();

    return questions.reduce((schema, question) => {
      if (question.type === 'checkbox') {
        return schema.extend({
          [question.id]: question.required
            ? z.array(z.string().trim()).nonempty({ error: 'Required' })
            : z.array(z.string().trim()).nullable().optional().default([]),
        });
      } else {
        return schema.extend({
          [question.id]: question.required
            ? z.string().trim().max(500).min(1, { error: 'Required' })
            : z.string().trim().max(500).nullable().optional().default(null),
        });
      }
    }, z.object({}));
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
    const survey = new SurveyConfig(event.surveyConfig);

    const userSurveys = await db.survey.findMany({
      select: { userId: true, answers: true },
      where: { event: { slug: this.eventSlug }, userId: { in: speakerIds } },
    });

    return userSurveys.reduce<Record<string, Array<SurveyDetailedAnswer>>>((acc, userSurvey) => {
      const answers = (userSurvey.answers ?? {}) as SurveyRawAnswers;
      acc[userSurvey.userId] = this.mapSurveyDetailedAnswers(survey.questions, answers);
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
