import type { Event } from '@prisma/client';
import { db } from 'prisma/db.server.ts';
import { SurveyInvalidError } from '~/libs/errors.server.ts';
import { flags } from '~/libs/feature-flags/flags.server.ts';
import { UserEvent } from '../event-settings/user-event.ts';
import { defaultQuestions } from './models/default-survey-questions.ts';
import { SurveyConfig } from './models/survey-config.ts';
import type { LegacyEventSurveyConfig, SurveyMoveQuestion, SurveyQuestion } from './types.ts';

// TODO: [survey] Add tests
export class EventSurveySettings extends UserEvent {
  static for(userId: string, teamSlug: string, eventSlug: string) {
    return new EventSurveySettings(userId, teamSlug, eventSlug);
  }

  async getConfig() {
    const event = await this.needsPermission('canEditEvent');
    const newSurveyActive = await flags.get('custom-survey');

    // Legacy survey
    if (!newSurveyActive) {
      return {
        legacy: true,
        enabled: event.surveyEnabled,
        questions: defaultQuestions,
        activeQuestions: (event.surveyQuestions || []) as Array<string>,
      };
    }

    // Automatically convert to legacy survey config
    let customSurvey = null;
    if (event.surveyEnabled) {
      customSurvey = await this.convertFromLegacySurvey(event);
    } else {
      customSurvey = new SurveyConfig(event.surveyConfig);
    }

    return {
      legacy: false,
      enabled: customSurvey.enabled,
      questions: customSurvey.questions,
    };
  }

  async toggleSurvey() {
    const event = await this.needsPermission('canEditEvent');
    const survey = new SurveyConfig(event.surveyConfig);
    survey.toggle();
    await db.event.update({ data: { surveyConfig: survey.toConfig() }, where: { id: event.id } });
    return survey.enabled;
  }

  async addQuestion(question: SurveyQuestion) {
    const event = await this.needsPermission('canEditEvent');
    const survey = new SurveyConfig(event.surveyConfig);
    survey.addQuestion(question);
    if (survey.questions.length > 8) {
      throw new SurveyInvalidError('You can only have up to 8 questions in the survey');
    }
    await db.event.update({ data: { surveyConfig: survey.toConfig() }, where: { id: event.id } });
  }

  async updateQuestion(question: SurveyQuestion) {
    const event = await this.needsPermission('canEditEvent');
    const survey = new SurveyConfig(event.surveyConfig);
    survey.updateQuestion(question);
    await db.event.update({ data: { surveyConfig: survey.toConfig() }, where: { id: event.id } });
  }

  async removeQuestion(questionId: string) {
    const event = await this.needsPermission('canEditEvent');
    const survey = new SurveyConfig(event.surveyConfig);
    survey.removeQuestion(questionId);
    await db.event.update({ data: { surveyConfig: survey.toConfig() }, where: { id: event.id } });
  }

  async moveQuestion({ id, direction }: SurveyMoveQuestion) {
    const event = await this.needsPermission('canEditEvent');
    const survey = new SurveyConfig(event.surveyConfig);
    survey.moveQuestion(id, direction);
    await db.event.update({ data: { surveyConfig: survey.toConfig() }, where: { id: event.id } });
  }

  // legacy survey functions
  async convertFromLegacySurvey(event: Event) {
    const enabled = true;
    const activeQuestions = (event.surveyQuestions as Array<string>) || [];
    const questions = defaultQuestions.filter((q) => activeQuestions.includes(q.id));
    const survey = new SurveyConfig({ enabled, questions });
    await db.event.update({
      data: { surveyConfig: survey.toConfig(), surveyEnabled: false, surveyQuestions: [] },
      where: { id: event.id },
    });
    return survey;
  }

  async toggleLegacySurvey() {
    const event = await this.needsPermission('canEditEvent');
    await db.event.update({ data: { surveyEnabled: !event.surveyEnabled }, where: { id: event.id } });
    return !event.surveyEnabled;
  }

  async updateLegacyQuestions({ activeQuestions }: LegacyEventSurveyConfig) {
    const event = await this.needsPermission('canEditEvent');
    await db.event.update({ data: { surveyQuestions: activeQuestions }, where: { id: event.id } });
  }
}
