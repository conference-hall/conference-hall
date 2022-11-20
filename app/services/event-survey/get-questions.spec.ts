import { disconnectDB, resetDB } from 'tests/db-helpers';
import { eventFactory } from 'tests/factories/events';
import { EventNotFoundError, SurveyNotEnabledError } from '../errors';
import { getQuestions } from './get-questions.server';

describe('#getQuestions', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

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

  it('throws an error when no question selected on survey', async () => {
    const event = await eventFactory({ attributes: { surveyEnabled: true } });
    await expect(getQuestions(event.slug)).rejects.toThrowError(SurveyNotEnabledError);
  });
});
