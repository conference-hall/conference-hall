import { disconnectDB, resetDB } from 'tests/db-helpers';
import { eventFactory } from 'tests/factories/events';
import { getSurveyQuestions } from './get-questions.server';

describe('#getSurveyQuestions', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('returns the default survey questions', async () => {
    const event = await eventFactory({ traits: ['withSurvey'] });

    const result = await getSurveyQuestions({ eventSlug: event.slug });
    if (!result.success) throw Error('Survey not found');

    const questionNames = result.data.map(({ name }) => name);
    expect(questionNames).toEqual(['gender', 'tshirt', 'accomodation', 'transports', 'diet', 'info']);
  });

  it('returns the selected survey questions', async () => {
    const event = await eventFactory({
      traits: ['withSurvey'],
      attributes: { surveyQuestions: ['gender'] },
    });

    const result = await getSurveyQuestions({ eventSlug: event.slug });
    if (!result.success) throw Error('Survey not found');

    const questionNames = result.data.map(({ name }) => name);
    expect(questionNames).toEqual(['gender']);
  });

  it('throws an error when event not found', async () => {
    const result = await getSurveyQuestions({ eventSlug: 'XXX' });
    expect(result.errors[0].message).toBe('Event not found');
  });

  it('throws an error when survey not enabled', async () => {
    const event = await eventFactory();
    const result = await getSurveyQuestions({ eventSlug: event.slug });
    expect(result.errors[0].message).toBe('Survey not enabled');
  });

  it('throws an error when no question selected on survey', async () => {
    const event = await eventFactory({ attributes: { surveyEnabled: true } });
    const result = await getSurveyQuestions({ eventSlug: event.slug });
    expect(result.errors[0].message).toBe('Survey not enabled');
  });
});
