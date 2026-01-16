import type { Event, Team, User } from 'prisma/generated/client.ts';
import { db } from 'prisma/db.server.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import type { SurveyQuestion } from '~/shared/types/survey.types.ts';
import { getAuthorizedEvent, getAuthorizedTeam } from '~/shared/authorization/authorization.server.ts';
import { ForbiddenOperationError } from '~/shared/errors.server.ts';
import { SurveyConfig } from '../models/survey-config.ts';
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
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      const config = await EventSurveySettings.for(authorizedEvent).getConfig();

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
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, eventWithoutSurvey.slug);
      const config = await EventSurveySettings.for(authorizedEvent).getConfig();

      expect(config.enabled).toEqual(false);
      expect(config.questions).toEqual([]);
    });

    it('throws an error when user not authorized', async () => {
      const authorizedTeam = await getAuthorizedTeam(reviewer.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      await expect(async () => {
        await EventSurveySettings.for(authorizedEvent).getConfig();
      }).rejects.toThrowError(ForbiddenOperationError);
    });
  });

  describe('toggleSurvey', () => {
    it('toggles the survey for custom survey', async () => {
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      const enabled = await EventSurveySettings.for(authorizedEvent).toggleSurvey();

      expect(enabled).toEqual(false);
    });

    it('throws an error when user not authorized', async () => {
      const authorizedTeam = await getAuthorizedTeam(reviewer.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      await expect(async () => {
        await EventSurveySettings.for(authorizedEvent).toggleSurvey();
      }).rejects.toThrowError(ForbiddenOperationError);
    });
  });

  describe('addQuestion', () => {
    const newQuestion: SurveyQuestion = {
      id: 'new-question',
      label: 'New Question',
      type: 'text',
      required: false,
    };

    it('adds a question to the survey', async () => {
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      const surveySettings = EventSurveySettings.for(authorizedEvent);
      await surveySettings.addQuestion(newQuestion);

      const result = await db.event.findUnique({ where: { id: event.id } });
      if (!result) expect.fail();
      const survey = new SurveyConfig(result?.surveyConfig);
      expect(survey.questions).toContainEqual(newQuestion);
    });

    it('throws an error when user not authorized', async () => {
      const authorizedTeam = await getAuthorizedTeam(reviewer.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      await expect(async () => {
        await EventSurveySettings.for(authorizedEvent).addQuestion(newQuestion);
      }).rejects.toThrowError(ForbiddenOperationError);
    });
  });

  describe('updateQuestion', () => {
    const updatedQuestion: SurveyQuestion = {
      id: 'info',
      label: 'Updated Question',
      type: 'text',
      required: true,
    };

    it('updates a question in the survey', async () => {
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      const surveySettings = EventSurveySettings.for(authorizedEvent);
      await surveySettings.updateQuestion(updatedQuestion);

      const result = await db.event.findUnique({ where: { id: event.id } });
      if (!result) expect.fail();
      const survey = new SurveyConfig(result?.surveyConfig);
      expect(survey.questions).toContainEqual(updatedQuestion);
    });

    it('throws an error when user not authorized', async () => {
      const authorizedTeam = await getAuthorizedTeam(reviewer.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      await expect(async () => {
        await EventSurveySettings.for(authorizedEvent).updateQuestion(updatedQuestion);
      }).rejects.toThrowError(ForbiddenOperationError);
    });
  });

  describe('removeQuestion', () => {
    it('removes a question from the survey', async () => {
      const questionId = 'info';

      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      const surveySettings = EventSurveySettings.for(authorizedEvent);
      await surveySettings.removeQuestion(questionId);

      const result = await db.event.findUnique({ where: { id: event.id } });
      if (!result) expect.fail();
      const survey = new SurveyConfig(result?.surveyConfig);
      expect(survey.questions).not.toContainEqual(expect.objectContaining({ id: questionId }));
    });

    it('throws an error when user not authorized', async () => {
      const questionId = 'existing-question';
      const authorizedTeam = await getAuthorizedTeam(reviewer.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      await expect(async () => {
        await EventSurveySettings.for(authorizedEvent).removeQuestion(questionId);
      }).rejects.toThrowError(ForbiddenOperationError);
    });
  });

  describe('moveQuestion', () => {
    it('moves a question in the survey', async () => {
      const moveParams: SurveyMoveQuestion = { id: 'info', direction: 'up' };

      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      const surveySettings = EventSurveySettings.for(authorizedEvent);
      await surveySettings.moveQuestion(moveParams);

      const result = await db.event.findUnique({ where: { id: event.id } });
      if (!result) expect.fail();
      const survey = new SurveyConfig(result?.surveyConfig);
      expect(survey.questions).toEqual([
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
      const authorizedTeam = await getAuthorizedTeam(reviewer.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      await expect(async () => {
        await EventSurveySettings.for(authorizedEvent).moveQuestion(moveParams);
      }).rejects.toThrowError(ForbiddenOperationError);
    });
  });
});
