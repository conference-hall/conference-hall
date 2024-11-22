import { eventFactory } from 'tests/factories/events.ts';

import { surveyFactory } from 'tests/factories/surveys.ts';
import { userFactory } from 'tests/factories/users.ts';
import { EventNotFoundError, SurveyNotEnabledError } from '~/libs/errors.server.ts';
import { SpeakerSurvey } from './speaker-survey.ts';

describe('SpeakerSurvey', () => {
  describe('getQuestions', () => {
    it('returns the default survey questions', async () => {
      const event = await eventFactory({ traits: ['withSurvey'] });

      const questions = await SpeakerSurvey.for(event.slug).getQuestions();

      const questionIds = questions.map(({ id }) => id);
      expect(questionIds).toEqual(['gender', 'tshirt', 'accomodation', 'transports', 'diet', 'info']);
    });

    it('returns the selected survey questions', async () => {
      const event = await eventFactory({
        traits: ['withSurvey'],
        attributes: { surveyQuestions: ['gender'] },
      });

      const questions = await SpeakerSurvey.for(event.slug).getQuestions();

      const questionIds = questions.map(({ id }) => id);
      expect(questionIds).toEqual(['gender']);
    });

    it('throws an error when event not found', async () => {
      await expect(SpeakerSurvey.for('XXX').getQuestions()).rejects.toThrowError(EventNotFoundError);
    });

    it('throws an error when survey not enabled', async () => {
      const event = await eventFactory();
      await expect(SpeakerSurvey.for(event.slug).getQuestions()).rejects.toThrowError(SurveyNotEnabledError);
    });
  });

  describe('getSpeakerAnswers', () => {
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

      const answers = await SpeakerSurvey.for(event.slug).getSpeakerAnswers(user2.id);

      expect(answers).toEqual({ gender: 'female' });
    });

    it('returns nothing when user hasnt respond any questions', async () => {
      const event = await eventFactory({ traits: ['withSurvey'] });
      const user = await userFactory();
      const answers = await SpeakerSurvey.for(event.slug).getSpeakerAnswers(user.id);
      expect(answers).toEqual({});
    });

    it('returns nothing when event doesnt exist', async () => {
      const user = await userFactory();
      const answers = await SpeakerSurvey.for('XXX').getSpeakerAnswers(user.id);
      expect(answers).toEqual({});
    });
  });

  describe('saveSpeakerAnswer', () => {
    it('creates user survey for event when it exists', async () => {
      const event = await eventFactory({ traits: ['withSurvey'] });
      const user = await userFactory();

      const survey = SpeakerSurvey.for(event.slug);
      await survey.saveSpeakerAnswer(user.id, {
        gender: 'male',
        tshirt: 'XL',
        accomodation: null,
        transports: ['taxi', 'train'],
        diet: ['vegan'],
        info: 'Hello',
      });

      const answers = await survey.getSpeakerAnswers(user.id);
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

      const survey = SpeakerSurvey.for(event.slug);
      await survey.saveSpeakerAnswer(user.id, {
        gender: 'female',
        tshirt: 'L',
        accomodation: null,
        transports: null,
        diet: ['vegetarian'],
        info: 'World',
      });

      const answers = await survey.getSpeakerAnswers(user.id);
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
        SpeakerSurvey.for('XXX').saveSpeakerAnswer(user.id, {
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

  // describe('getMultipleSpeakerAnswers', () => {
  //   it('returns multiple speakers answers for an event', async () => {
  //     const event = await eventFactory({ traits: ['withSurvey'] });
  //     const event2 = await eventFactory({ traits: ['withSurvey'] });
  //     const user1 = await userFactory();
  //     await surveyFactory({
  //       user: user1,
  //       event,
  //       attributes: { answers: { gender: 'male' } },
  //     });
  //     const user2 = await userFactory();
  //     await surveyFactory({
  //       user: user2,
  //       event,
  //       attributes: { answers: { gender: 'female' } },
  //     });
  //     const user3 = await userFactory();
  //     await surveyFactory({
  //       user: user3,
  //       event: event2,
  //       attributes: { answers: { gender: 'female' } },
  //     });

  //     const answers = await SpeakerSurvey.for(event.slug).getMultipleSpeakerAnswers([user1.id, user2.id]);

  //     expect(answers).toEqual(
  //       expect.arrayContaining([
  //         { userId: user1.id, answers: { gender: 'male' } },
  //         { userId: user2.id, answers: { gender: 'female' } },
  //       ]),
  //     );
  //   });

  //   it('returns nothing when user hasnt respond any questions', async () => {
  //     const event = await eventFactory({ traits: ['withSurvey'] });
  //     const user = await userFactory();
  //     const answers = await SpeakerSurvey.for(event.slug).getMultipleSpeakerAnswers([user.id]);
  //     expect(answers).toEqual([]);
  //   });

  //   it('returns nothing when event doesnt exist', async () => {
  //     const user = await userFactory();
  //     const answers = await SpeakerSurvey.for('XXX').getMultipleSpeakerAnswers([user.id]);
  //     expect(answers).toEqual([]);
  //   });
  // });
});
