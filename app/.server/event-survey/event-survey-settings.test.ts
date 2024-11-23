import { eventFactory } from 'tests/factories/events.ts';

import type { Event, Team, User } from '@prisma/client';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { ForbiddenOperationError } from '~/libs/errors.server.ts';
import { flags } from '~/libs/feature-flags/flags.server.ts';
import { EventSurveySettings } from './event-survey-settings.ts';
import { defaultQuestions } from './models/default-survey-questions.ts';
import type { SurveyMoveQuestion, SurveyQuestion } from './types.ts';

describe('EventSurveySettings', () => {
  describe('For legacy survey', () => {
    let owner: User;
    let reviewer: User;
    let team: Team;
    let event: Event;

    beforeEach(async () => {
      await flags.set('custom-survey', false);
      owner = await userFactory();
      reviewer = await userFactory();
      team = await teamFactory({ owners: [owner], reviewers: [reviewer] });
      event = await eventFactory({ team, traits: ['withSurvey'] });
    });

    describe('getConfig', () => {
      it('returns the default survey questions', async () => {
        const config = await EventSurveySettings.for(owner.id, team.slug, event.slug).getConfig();

        expect(config.legacy).toEqual(true);
        expect(config.enabled).toEqual(true);
        expect(config.questions).toEqual(defaultQuestions);
        expect(config.activeQuestions).toEqual(['gender', 'tshirt', 'diet', 'accomodation', 'transports', 'info']);
      });

      it('throws an error when user not authorized', async () => {
        await expect(EventSurveySettings.for(reviewer.id, team.slug, event.slug).getConfig()).rejects.toThrowError(
          ForbiddenOperationError,
        );
      });
    });

    describe('toggleLegacySurvey', () => {
      it('toggles the survey', async () => {
        const enabled = await EventSurveySettings.for(owner.id, team.slug, event.slug).toggleLegacySurvey();

        expect(enabled).toEqual(false);
      });

      it('throws an error when user not authorized', async () => {
        await expect(
          EventSurveySettings.for(reviewer.id, team.slug, event.slug).toggleLegacySurvey(),
        ).rejects.toThrowError(ForbiddenOperationError);
      });
    });

    describe('updateLegacyQuestions', () => {
      it('updates the legacy survey questions', async () => {
        const activeQuestions = ['gender', 'tshirt'];

        const surveySettings = EventSurveySettings.for(owner.id, team.slug, event.slug);
        await surveySettings.updateLegacyQuestions({ activeQuestions });

        const config = await surveySettings.getConfig();
        expect(config.activeQuestions).toEqual(activeQuestions);
      });

      it('throws an error when user not authorized', async () => {
        const activeQuestions = ['gender', 'tshirt'];

        await expect(
          EventSurveySettings.for(reviewer.id, team.slug, event.slug).updateLegacyQuestions({ activeQuestions }),
        ).rejects.toThrowError(ForbiddenOperationError);
      });
    });
  });

  describe('For custom survey', () => {
    let owner: User;
    let reviewer: User;
    let team: Team;
    let event: Event;

    beforeEach(async () => {
      await flags.set('custom-survey', true);
      owner = await userFactory();
      reviewer = await userFactory();
      team = await teamFactory({ owners: [owner], reviewers: [reviewer] });
      event = await eventFactory({ team, traits: ['withSurveyConfig'] });
    });

    describe('getConfig', () => {
      it('returns the enabled survey config with questions', async () => {
        const config = await EventSurveySettings.for(owner.id, team.slug, event.slug).getConfig();

        expect(config.legacy).toEqual(false);
        expect(config.enabled).toEqual(true);
        expect(config.questions).toEqual([
          {
            id: 'name',
            label: 'What is your name?',
            required: true,
            type: 'text',
          },
          {
            id: 'info',
            label: 'Do you have specific information to share?',
            required: false,
            type: 'text',
          },
        ]);
      });

      it('returns the disabled survey config with no questions', async () => {
        const eventWithoutSurvey = await eventFactory({ team });
        const config = await EventSurveySettings.for(owner.id, team.slug, eventWithoutSurvey.slug).getConfig();

        expect(config.legacy).toEqual(false);
        expect(config.enabled).toEqual(false);
        expect(config.questions).toEqual([]);
      });

      it('throws an error when user not authorized', async () => {
        await expect(EventSurveySettings.for(reviewer.id, team.slug, event.slug).getConfig()).rejects.toThrowError(
          ForbiddenOperationError,
        );
      });
    });

    describe('toggleSurvey', () => {
      it('toggles the survey for custom survey', async () => {
        const enabled = await EventSurveySettings.for(owner.id, team.slug, event.slug).toggleSurvey();

        expect(enabled).toEqual(false);
      });

      it('throws an error when user not authorized', async () => {
        await expect(EventSurveySettings.for(reviewer.id, team.slug, event.slug).toggleSurvey()).rejects.toThrowError(
          ForbiddenOperationError,
        );
      });
    });

    describe('addQuestion', () => {
      it('adds a question to the survey', async () => {
        const newQuestion: SurveyQuestion = {
          id: 'new-question',
          label: 'New Question',
          type: 'text',
          required: false,
        };

        const surveySettings = EventSurveySettings.for(owner.id, team.slug, event.slug);
        await surveySettings.addQuestion(newQuestion);

        const config = await surveySettings.getConfig();
        expect(config.questions).toContainEqual(newQuestion);
      });

      it('throws an error when user not authorized', async () => {
        const newQuestion: SurveyQuestion = {
          id: 'new-question',
          label: 'New Question',
          type: 'text',
          required: false,
        };

        await expect(
          EventSurveySettings.for(reviewer.id, team.slug, event.slug).addQuestion(newQuestion),
        ).rejects.toThrowError(ForbiddenOperationError);
      });
    });

    describe('updateQuestion', () => {
      it('updates a question in the survey', async () => {
        const updatedQuestion: SurveyQuestion = {
          id: 'info',
          label: 'Updated Question',
          type: 'text',
          required: true,
        };

        const surveySettings = EventSurveySettings.for(owner.id, team.slug, event.slug);
        await surveySettings.updateQuestion(updatedQuestion);

        const config = await surveySettings.getConfig();
        expect(config.questions).toContainEqual(updatedQuestion);
      });

      it('throws an error when user not authorized', async () => {
        const updatedQuestion: SurveyQuestion = {
          id: 'info',
          label: 'Updated Question',
          type: 'text',
          required: true,
        };

        await expect(
          EventSurveySettings.for(reviewer.id, team.slug, event.slug).updateQuestion(updatedQuestion),
        ).rejects.toThrowError(ForbiddenOperationError);
      });
    });

    describe('removeQuestion', () => {
      it('removes a question from the survey', async () => {
        const questionId = 'info';

        const surveySettings = EventSurveySettings.for(owner.id, team.slug, event.slug);
        await surveySettings.removeQuestion(questionId);

        const config = await surveySettings.getConfig();
        expect(config.questions).not.toContainEqual(expect.objectContaining({ id: questionId }));
      });

      it('throws an error when user not authorized', async () => {
        const questionId = 'existing-question';

        await expect(
          EventSurveySettings.for(reviewer.id, team.slug, event.slug).removeQuestion(questionId),
        ).rejects.toThrowError(ForbiddenOperationError);
      });
    });

    describe('moveQuestion', () => {
      it('moves a question in the survey', async () => {
        const moveParams: SurveyMoveQuestion = { id: 'info', direction: 'up' };

        const surveySettings = EventSurveySettings.for(owner.id, team.slug, event.slug);
        await surveySettings.moveQuestion(moveParams);

        const config = await surveySettings.getConfig();
        expect(config.questions).toEqual([
          {
            id: 'info',
            label: 'Do you have specific information to share?',
            required: false,
            type: 'text',
          },
          {
            id: 'name',
            label: 'What is your name?',
            required: true,
            type: 'text',
          },
        ]);
      });

      it('throws an error when user not authorized', async () => {
        const moveParams: SurveyMoveQuestion = { id: 'info', direction: 'up' };

        await expect(
          EventSurveySettings.for(reviewer.id, team.slug, event.slug).moveQuestion(moveParams),
        ).rejects.toThrowError(ForbiddenOperationError);
      });
    });
  });

  describe('convertFromLegacySurvey', () => {
    it('converts the legacy survey to a custom survey', async () => {
      const owner = await userFactory();
      const reviewer = await userFactory();
      const team = await teamFactory({ owners: [owner], reviewers: [reviewer] });
      const event = await eventFactory({ team, traits: ['withSurvey'], attributes: { surveyQuestions: ['gender'] } });

      const surveySettings = EventSurveySettings.for(owner.id, team.slug, event.slug);
      await surveySettings.convertFromLegacySurvey(event);

      // legacy config
      await flags.set('custom-survey', false);
      const legacyConfig = await surveySettings.getConfig();
      expect(legacyConfig.enabled).toEqual(false);
      expect(legacyConfig.activeQuestions).toEqual([]);

      // new config
      await flags.set('custom-survey', true);
      const newConfig = await surveySettings.getConfig();
      expect(newConfig.enabled).toEqual(true);
      expect(newConfig.questions).toEqual([defaultQuestions[0]]);
    });
  });
});
