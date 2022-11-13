import { disconnectDB, resetDB } from 'tests/db-helpers';
import { eventFactory } from 'tests/factories/events';
import { surveyFactory } from 'tests/factories/surveys';
import { userFactory } from 'tests/factories/users';
import { getSurveyAnswers } from './get-answers.server';
import { saveSurvey } from './save-survey.server';

describe('#saveSurvey', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('creates user survey for event when it exists', async () => {
    const event = await eventFactory({ traits: ['withSurvey'] });
    const user = await userFactory();

    await saveSurvey({
      speakerId: user.id,
      eventSlug: event.slug,
      data: {
        gender: 'male',
        tshirt: 'XL',
        accomodation: null,
        transports: ['taxi', 'train'],
        diet: ['vegan'],
        info: 'Hello',
      },
    });

    const result = await getSurveyAnswers({ eventSlug: event.slug, speakerId: user.id });

    expect(result.success && result.data).toEqual({
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

    await saveSurvey({
      speakerId: user.id,
      eventSlug: event.slug,
      data: {
        gender: 'female',
        tshirt: 'L',
        accomodation: null,
        transports: null,
        diet: ['vegetarian'],
        info: 'World',
      },
    });

    const result = await getSurveyAnswers({ eventSlug: event.slug, speakerId: user.id });

    expect(result.success && result.data).toEqual({
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
    const result = await saveSurvey({
      speakerId: user.id,
      eventSlug: 'XXX',
      data: {
        gender: 'female',
        tshirt: 'L',
        accomodation: null,
        transports: null,
        diet: ['vegetarian'],
        info: 'World',
      },
    });
    expect(result.errors[0].message).toBe('Event not found');
  });
});
