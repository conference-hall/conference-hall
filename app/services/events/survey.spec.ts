import { resetDB, disconnectDB } from '../../../tests/db-helpers';
import { eventFactory } from '../../../tests/factories/events';
import { surveyFactory } from '../../../tests/factories/surveys';
import { userFactory } from '../../../tests/factories/users';
import { EventNotFoundError, SurveyNotEnabledError } from '../errors';
import { getSurveyAnswers, getSurveyQuestions, saveSurvey } from './survey.server';

describe('#getSurveyQuestions', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('returns the default survey questions', async () => {
    const event = await eventFactory({ traits: ['withSurvey'] });

    const questions = await getSurveyQuestions(event.slug);

    const questionNames = questions.map(({ name }) => name);
    expect(questionNames).toEqual(['gender', 'tshirt', 'accomodation', 'transports', 'diet', 'info']);
  });

  it('returns the selected survey questions', async () => {
    const event = await eventFactory({
      traits: ['withSurvey'],
      attributes: { surveyQuestions: ['gender'] },
    });

    const questions = await getSurveyQuestions(event.slug);

    const questionNames = questions.map(({ name }) => name);
    expect(questionNames).toEqual(['gender']);
  });

  it('throws an error when event not found', async () => {
    await expect(getSurveyQuestions('XXX')).rejects.toThrowError(EventNotFoundError);
  });

  it('throws an error when survey not enabled', async () => {
    const event = await eventFactory();
    await expect(getSurveyQuestions(event.slug)).rejects.toThrowError(SurveyNotEnabledError);
  });

  it('throws an error when no question selected on survey', async () => {
    const event = await eventFactory({ attributes: { surveyEnabled: true } });
    await expect(getSurveyQuestions(event.slug)).rejects.toThrowError(SurveyNotEnabledError);
  });
});

describe('#getSurveyAnswers', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('returns the user answers for an event', async () => {
    const event = await eventFactory({ traits: ['withSurvey'] });
    const user1 = await userFactory();
    await surveyFactory({
      user: user1,
      event,
      attributes: { answers: { gender: 'male' } },
    });
    const user2 = await userFactory();
    await surveyFactory({
      user: user2,
      event,
      attributes: { answers: { gender: 'female' } },
    });

    const answers = await getSurveyAnswers(event.slug, user2.id);

    expect(answers).toEqual({ gender: 'female' });
  });

  it('returns nothing when user hasnt respond any questions', async () => {
    const event = await eventFactory({ traits: ['withSurvey'] });
    const user = await userFactory();
    const answers = await getSurveyAnswers(event.slug, user.id);
    expect(answers).toEqual({});
  });

  it('returns nothing when event doesnt exist', async () => {
    const user = await userFactory();
    const answers = await getSurveyAnswers('XXX', user.id);
    expect(answers).toEqual({});
  });
});

describe('#saveSurvey', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('creates user survey for event when it exists', async () => {
    const event = await eventFactory({ traits: ['withSurvey'] });
    const user = await userFactory();

    await saveSurvey(user.id, event.slug, {
      gender: 'male',
      tshirt: 'XL',
      accomodation: null,
      transports: ['taxi', 'train'],
      diet: ['vegan'],
      info: 'Hello',
    });

    const survey = await getSurveyAnswers(event.slug, user.id);

    expect(survey).toEqual({
      gender: 'male',
      tshirt: 'XL',
      accomodation: null,
      transports: ['taxi', 'train'],
      diet: ['vegan'],
      info: 'Hello',
    });
  });

  it('updates user survey for event when it exists', async () => {
    const event = await eventFactory({ traits: ['withSurvey'] });
    const user = await userFactory();
    await surveyFactory({
      user,
      event,
      attributes: {
        answers: {
          gender: 'male',
          tshirt: 'XL',
          accomodation: null,
          transports: ['taxi', 'train'],
          diet: ['vegan'],
          info: 'Hello',
        },
      },
    });

    await saveSurvey(user.id, event.slug, {
      gender: 'female',
      tshirt: 'L',
      accomodation: null,
      transports: null,
      diet: ['vegetarian'],
      info: 'World',
    });

    const survey = await getSurveyAnswers(event.slug, user.id);

    expect(survey).toEqual({
      gender: 'female',
      tshirt: 'L',
      accomodation: null,
      transports: null,
      diet: ['vegetarian'],
      info: 'World',
    });
  });

  it('throws an error when event not found', async () => {
    const user = await userFactory();
    await expect(
      saveSurvey(user.id, 'XXX', {
        gender: 'female',
        tshirt: 'L',
        accomodation: null,
        transports: null,
        diet: ['vegetarian'],
        info: 'World',
      })
    ).rejects.toThrowError(EventNotFoundError);
  });
});
