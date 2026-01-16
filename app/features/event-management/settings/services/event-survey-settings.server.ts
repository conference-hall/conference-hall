import { db } from 'prisma/db.server.ts';
import z from 'zod';
import type { AuthorizedEvent } from '~/shared/authorization/types.ts';
import type { SurveyQuestion } from '~/shared/types/survey.types.ts';
import { ForbiddenOperationError, SurveyInvalidError } from '~/shared/errors.server.ts';
import { SurveyConfig } from '../models/survey-config.ts';

export const SurveyRemoveQuestionSchema = z.object({ id: z.string() });
export const SurveyMoveQuestionSchema = z.object({ id: z.string(), direction: z.enum(['up', 'down']) });
export type SurveyMoveQuestion = z.infer<typeof SurveyMoveQuestionSchema>;

export class EventSurveySettings {
  constructor(private authorizedEvent: AuthorizedEvent) {}

  static for(authorizedEvent: AuthorizedEvent) {
    return new EventSurveySettings(authorizedEvent);
  }

  async getConfig() {
    const { event, permissions } = this.authorizedEvent;
    if (!permissions.canEditEvent) throw new ForbiddenOperationError();

    const survey = new SurveyConfig(event.surveyConfig);

    return {
      enabled: survey.enabled,
      questions: survey.questions,
    };
  }

  async toggleSurvey() {
    const { event, permissions } = this.authorizedEvent;
    if (!permissions.canEditEvent) throw new ForbiddenOperationError();

    const survey = new SurveyConfig(event.surveyConfig);
    survey.toggle();
    await db.event.update({ data: { surveyConfig: survey.toConfig() }, where: { id: event.id } });
    return survey.enabled;
  }

  async addQuestion(question: SurveyQuestion) {
    const { event, permissions } = this.authorizedEvent;
    if (!permissions.canEditEvent) throw new ForbiddenOperationError();

    const survey = new SurveyConfig(event.surveyConfig);
    survey.addQuestion(question);
    if (survey.questions.length > 8) {
      throw new SurveyInvalidError('You can only have up to 8 questions in the survey');
    }
    await db.event.update({ data: { surveyConfig: survey.toConfig() }, where: { id: event.id } });
  }

  async updateQuestion(question: SurveyQuestion) {
    const { event, permissions } = this.authorizedEvent;
    if (!permissions.canEditEvent) throw new ForbiddenOperationError();
    const survey = new SurveyConfig(event.surveyConfig);
    survey.updateQuestion(question);
    await db.event.update({ data: { surveyConfig: survey.toConfig() }, where: { id: event.id } });
  }

  async removeQuestion(questionId: string) {
    const { event, permissions } = this.authorizedEvent;
    if (!permissions.canEditEvent) throw new ForbiddenOperationError();
    const survey = new SurveyConfig(event.surveyConfig);
    survey.removeQuestion(questionId);
    await db.event.update({ data: { surveyConfig: survey.toConfig() }, where: { id: event.id } });
  }

  async moveQuestion({ id, direction }: SurveyMoveQuestion) {
    const { event, permissions } = this.authorizedEvent;
    if (!permissions.canEditEvent) throw new ForbiddenOperationError();
    const survey = new SurveyConfig(event.surveyConfig);
    survey.moveQuestion(id, direction);
    await db.event.update({ data: { surveyConfig: survey.toConfig() }, where: { id: event.id } });
  }
}
