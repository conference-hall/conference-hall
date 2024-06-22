import { eventFactory } from 'tests/factories/events.ts';
import { surveyFactory } from 'tests/factories/surveys.ts';
import { userFactory } from 'tests/factories/users.ts';

import { EventNotFoundError } from '~/libs/errors.server.ts';

import { SpeakerAnswers } from './speaker-answers.ts';
import { SurveySchema } from './speaker-answers.types.ts';

describe('SpeakerAnswers', () => {
  describe('answers', () => {
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

      const answers = await SpeakerAnswers.for(user2.id, event.slug).answers();

      expect(answers).toEqual({ gender: 'female' });
    });

    it('returns nothing when user hasnt respond any questions', async () => {
      const event = await eventFactory({ traits: ['withSurvey'] });
      const user = await userFactory();
      const answers = await SpeakerAnswers.for(user.id, event.slug).answers();
      expect(answers).toEqual({});
    });

    it('returns nothing when event doesnt exist', async () => {
      const user = await userFactory();
      const answers = await SpeakerAnswers.for(user.id, 'XXX').answers();
      expect(answers).toEqual({});
    });
  });

  describe('save', () => {
    it('creates user survey for event when it exists', async () => {
      const event = await eventFactory({ traits: ['withSurvey'] });
      const user = await userFactory();

      const survey = SpeakerAnswers.for(user.id, event.slug);
      await survey.save({
        gender: 'male',
        tshirt: 'XL',
        accomodation: null,
        transports: ['taxi', 'train'],
        diet: ['vegan'],
        info: 'Hello',
      });

      const answers = await survey.answers();
      expect(answers).toEqual({
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

      const survey = SpeakerAnswers.for(user.id, event.slug);
      await survey.save({
        gender: 'female',
        tshirt: 'L',
        accomodation: null,
        transports: null,
        diet: ['vegetarian'],
        info: 'World',
      });

      const answers = await survey.answers();
      expect(answers).toEqual({
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
        SpeakerAnswers.for(user.id, 'XXX').save({
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

  describe('Validate SurveySchema', () => {
    it('validates survey form inputs', async () => {
      const data = {
        gender: 'male',
        tshirt: 'XL',
        accomodation: 'true',
        transports: ['taxi', 'train'],
        diet: ['vegan', 'vegetarian'],
        info: 'Hello',
      };

      const result = SurveySchema.safeParse(data);
      expect(result.success && result.data).toEqual({
        gender: 'male',
        tshirt: 'XL',
        accomodation: 'true',
        transports: ['taxi', 'train'],
        diet: ['vegan', 'vegetarian'],
        info: 'Hello',
      });
    });
  });
});
