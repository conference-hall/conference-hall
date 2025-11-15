import { db } from '@conference-hall/database';
import z from 'zod';
import { SurveyInvalidError } from '~/shared/errors.server.ts';
import type { SurveyQuestion } from '~/shared/types/survey.types.ts';
import { EventAuthorization } from '~/shared/user/event-authorization.server.ts';
import { SurveyConfig } from '../models/survey-config.ts';

export const SurveyRemoveQuestionSchema = z.object({ id: z.string() });
export const SurveyMoveQuestionSchema = z.object({ id: z.string(), direction: z.enum(['up', 'down']) });
export type SurveyMoveQuestion = z.infer<typeof SurveyMoveQuestionSchema>;

export class EventSurveySettings extends EventAuthorization {
  static for(userId: string, teamSlug: string, eventSlug: string) {
    return new EventSurveySettings(userId, teamSlug, eventSlug);
  }

  async getConfig() {
    const { event } = await this.checkAuthorizedEvent('canEditEvent');
    const survey = new SurveyConfig(event.surveyConfig);

    return {
      legacy: false,
      enabled: survey.enabled,
      questions: survey.questions,
    };
  }

  async toggleSurvey() {
    const { event } = await this.checkAuthorizedEvent('canEditEvent');
    const survey = new SurveyConfig(event.surveyConfig);
    survey.toggle();
    await db.event.update({ data: { surveyConfig: survey.toConfig() }, where: { id: event.id } });
    return survey.enabled;
  }

  async addQuestion(question: SurveyQuestion) {
    const { event } = await this.checkAuthorizedEvent('canEditEvent');
    const survey = new SurveyConfig(event.surveyConfig);
    survey.addQuestion(question);
    if (survey.questions.length > 8) {
      throw new SurveyInvalidError('You can only have up to 8 questions in the survey');
    }
    await db.event.update({ data: { surveyConfig: survey.toConfig() }, where: { id: event.id } });
  }

  async updateQuestion(question: SurveyQuestion) {
    const { event } = await this.checkAuthorizedEvent('canEditEvent');
    const survey = new SurveyConfig(event.surveyConfig);
    survey.updateQuestion(question);
    await db.event.update({ data: { surveyConfig: survey.toConfig() }, where: { id: event.id } });
  }

  async removeQuestion(questionId: string) {
    const { event } = await this.checkAuthorizedEvent('canEditEvent');
    const survey = new SurveyConfig(event.surveyConfig);
    survey.removeQuestion(questionId);
    await db.event.update({ data: { surveyConfig: survey.toConfig() }, where: { id: event.id } });
  }

  async moveQuestion({ id, direction }: SurveyMoveQuestion) {
    const { event } = await this.checkAuthorizedEvent('canEditEvent');
    const survey = new SurveyConfig(event.surveyConfig);
    survey.moveQuestion(id, direction);
    await db.event.update({ data: { surveyConfig: survey.toConfig() }, where: { id: event.id } });
  }
}
