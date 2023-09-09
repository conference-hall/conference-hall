import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { disconnectDB, resetDB } from '../../../../tests/db-helpers';
import { eventFactory } from '../../../../tests/factories/events';
import { surveyFactory } from '../../../../tests/factories/surveys';
import { userFactory } from '../../../../tests/factories/users';
import { EventNotFoundError } from '../../../libs/errors';
import { getAnswers } from './get-answers.server';
import { saveSurvey } from './save-survey.server';

describe('#saveSurvey', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(async () => {
    await disconnectDB();
  });

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

    const survey = await getAnswers(event.slug, user.id);

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

    const survey = await getAnswers(event.slug, user.id);

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
      }),
    ).rejects.toThrowError(EventNotFoundError);
  });
});
