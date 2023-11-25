import { eventFactory } from 'tests/factories/events';

import { EventNotFoundError, SurveyNotEnabledError } from '~/libs/errors';

import { EventSurvey } from './EventSurvey';

describe('EventSurvey', () => {
  describe('questions', () => {
    it('returns the default survey questions', async () => {
      const event = await eventFactory({ traits: ['withSurvey'] });

      const questions = await EventSurvey.of(event.slug).questions();

      const questionNames = questions.map(({ name }) => name);
      expect(questionNames).toEqual(['gender', 'tshirt', 'accomodation', 'transports', 'diet', 'info']);
    });

    it('returns the selected survey questions', async () => {
      const event = await eventFactory({
        traits: ['withSurvey'],
        attributes: { surveyQuestions: ['gender'] },
      });

      const questions = await EventSurvey.of(event.slug).questions();

      const questionNames = questions.map(({ name }) => name);
      expect(questionNames).toEqual(['gender']);
    });

    it('throws an error when event not found', async () => {
      await expect(EventSurvey.of('XXX').questions()).rejects.toThrowError(EventNotFoundError);
    });

    it('throws an error when survey not enabled', async () => {
      const event = await eventFactory();
      await expect(EventSurvey.of(event.slug).questions()).rejects.toThrowError(SurveyNotEnabledError);
    });
  });
});
