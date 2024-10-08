import { eventFactory } from 'tests/factories/events.ts';

import { EventNotFoundError, SurveyNotEnabledError } from '~/libs/errors.server.ts';

import { CfpSurvey } from './cfp-survey.ts';

describe('CfpSurvey', () => {
  describe('questions', () => {
    it('returns the default survey questions', async () => {
      const event = await eventFactory({ traits: ['withSurvey'] });

      const questions = await CfpSurvey.of(event.slug).questions();

      const questionIds = questions.map(({ id }) => id);
      expect(questionIds).toEqual(['gender', 'tshirt', 'accomodation', 'transports', 'diet', 'info']);
    });

    it('returns the selected survey questions', async () => {
      const event = await eventFactory({
        traits: ['withSurvey'],
        attributes: { surveyQuestions: ['gender'] },
      });

      const questions = await CfpSurvey.of(event.slug).questions();

      const questionIds = questions.map(({ id }) => id);
      expect(questionIds).toEqual(['gender']);
    });

    it('throws an error when event not found', async () => {
      await expect(CfpSurvey.of('XXX').questions()).rejects.toThrowError(EventNotFoundError);
    });

    it('throws an error when survey not enabled', async () => {
      const event = await eventFactory();
      await expect(CfpSurvey.of(event.slug).questions()).rejects.toThrowError(SurveyNotEnabledError);
    });
  });
});
