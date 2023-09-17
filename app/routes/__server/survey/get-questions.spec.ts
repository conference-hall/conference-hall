import { eventFactory } from 'tests/factories/events.ts';

import { EventNotFoundError, SurveyNotEnabledError } from '~/libs/errors.ts';

import { getQuestions } from './get-questions.server.ts';

describe('#getQuestions', () => {
  it('returns the default survey questions', async () => {
    const event = await eventFactory({ traits: ['withSurvey'] });

    const questions = await getQuestions(event.slug);

    const questionNames = questions.map(({ name }) => name);
    expect(questionNames).toEqual(['gender', 'tshirt', 'accomodation', 'transports', 'diet', 'info']);
  });

  it('returns the selected survey questions', async () => {
    const event = await eventFactory({
      traits: ['withSurvey'],
      attributes: { surveyQuestions: ['gender'] },
    });

    const questions = await getQuestions(event.slug);

    const questionNames = questions.map(({ name }) => name);
    expect(questionNames).toEqual(['gender']);
  });

  it('throws an error when event not found', async () => {
    await expect(getQuestions('XXX')).rejects.toThrowError(EventNotFoundError);
  });

  it('throws an error when survey not enabled', async () => {
    const event = await eventFactory();
    await expect(getQuestions(event.slug)).rejects.toThrowError(SurveyNotEnabledError);
  });
});
