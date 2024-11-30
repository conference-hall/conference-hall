import { eventFactory } from 'tests/factories/events.ts';

import type { Event, Team, User } from '@prisma/client';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { ForbiddenOperationError } from '~/libs/errors.server.ts';
import { EventSurveySettings } from './event-survey-settings.ts';
import type { SurveyMoveQuestion, SurveyQuestion } from './types.ts';

describe('EventSurveySettings', () => {
  let owner: User;
  let reviewer: User;
  let team: Team;
  let event: Event;

  beforeEach(async () => {
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
