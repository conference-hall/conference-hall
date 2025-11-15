import type { Event, Team, User } from '@conference-hall/database';
import { eventFactory } from '@conference-hall/database/tests/factories/events.ts';
import { teamFactory } from '@conference-hall/database/tests/factories/team.ts';
import { userFactory } from '@conference-hall/database/tests/factories/users.ts';
import { ForbiddenOperationError } from '~/shared/errors.server.ts';
import type { SurveyQuestion } from '~/shared/types/survey.types.ts';
import { EventSurveySettings, type SurveyMoveQuestion } from './event-survey-settings.server.ts';

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
          id: 'accomodation',
          label: 'Do you need accommodation funding? (Hotel, AirBnB...)',
          type: 'radio',
          required: false,
          options: [
            { id: 'yes', label: 'Yes' },
            { id: 'no', label: 'No' },
          ],
        },
        {
          id: 'transports',
          label: 'Do you need transports funding?',
          type: 'checkbox',
          required: false,
          options: [
            { id: 'taxi', label: 'Taxi' },
            { id: 'train', label: 'Train' },
            { id: 'plane', label: 'Plane' },
          ],
        },
        {
          id: 'info',
          label: 'Do you have specific information to share?',
          type: 'text',
          required: false,
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
          id: 'accomodation',
          label: 'Do you need accommodation funding? (Hotel, AirBnB...)',
          type: 'radio',
          required: false,
          options: [
            { id: 'yes', label: 'Yes' },
            { id: 'no', label: 'No' },
          ],
        },
        {
          id: 'info',
          label: 'Do you have specific information to share?',
          type: 'text',
          required: false,
        },
        {
          id: 'transports',
          label: 'Do you need transports funding?',
          type: 'checkbox',
          required: false,
          options: [
            { id: 'taxi', label: 'Taxi' },
            { id: 'train', label: 'Train' },
            { id: 'plane', label: 'Plane' },
          ],
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
