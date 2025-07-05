import { eventFactory } from 'tests/factories/events.ts';

import { surveyFactory } from 'tests/factories/surveys.ts';
import { userFactory } from 'tests/factories/users.ts';
import { EventNotFoundError, SurveyNotEnabledError } from '~/shared/errors.server.ts';
import { SpeakerSurvey } from './speaker-survey.ts';

describe('SpeakerSurvey', () => {
  describe('getQuestions', () => {
    it('returns the custom survey questions', async () => {
      const event = await eventFactory({ traits: ['withSurveyConfig'] });
      const questions = await SpeakerSurvey.for(event.slug).getQuestions();

      expect(questions).toEqual([
        {
          id: 'accomodation',
          label: 'Do you need accommodation funding? (Hotel, AirBnB...)',
          type: 'radio',
          required: false,
          options: [
            { id: 'yes', label: 'Yes' },
            { id: 'no', label: 'No' },
          ],
        },
        {
          id: 'transports',
          label: 'Do you need transports funding?',
          type: 'checkbox',
          required: false,
          options: [
            { id: 'taxi', label: 'Taxi' },
            { id: 'train', label: 'Train' },
            { id: 'plane', label: 'Plane' },
          ],
        },
        {
          id: 'info',
          label: 'Do you have specific information to share?',
          type: 'text',
          required: false,
        },
      ]);
    });

    it('throws an error when survey is not enabled', async () => {
      const event = await eventFactory();

      await expect(SpeakerSurvey.for(event.slug).getQuestions()).rejects.toThrowError(SurveyNotEnabledError);
    });

    it('throws an EventNotFoundError when event does not exist', async () => {
      await expect(SpeakerSurvey.for('non-existent-event').getQuestions()).rejects.toThrowError(EventNotFoundError);
    });
  });

  describe('buildSurveySchema', () => {
    it('builds schema for custom survey questions', async () => {
      const event = await eventFactory({ traits: ['withSurveyConfig'] });

      const survey = SpeakerSurvey.for(event.slug);
      const schema = await survey.buildSurveySchema();

      const validData = {
        accomodation: 'yes',
        info: 'Some info',
      };

      expect(schema.parse(validData)).toEqual(validData);
    });

    it('builds schema for checkbox question type', async () => {
      const event = await eventFactory({
        attributes: {
          surveyConfig: {
            enabled: true,
            questions: [{ id: 'diet', label: 'Dietary preferences', type: 'checkbox', required: true }],
          },
        },
      });

      const survey = SpeakerSurvey.for(event.slug);
      const schema = await survey.buildSurveySchema();

      const validData = {
        diet: ['vegan', 'vegetarian'],
      };

      expect(schema.parse(validData)).toEqual(validData);
    });

    it('throws an error when a required question answer is not provided', async () => {
      const event = await eventFactory({
        attributes: {
          surveyConfig: {
            enabled: true,
            questions: [{ id: 'name', label: 'What is your name?', type: 'text', required: true }],
          },
        },
      });

      const survey = SpeakerSurvey.for(event.slug);
      const schema = await survey.buildSurveySchema();

      const invalidData = {
        name: '',
      };

      expect(() => schema.parse(invalidData)).toThrowError();
    });

    it('throws an error when event does not exist', async () => {
      const survey = SpeakerSurvey.for('non-existent-event');
      await expect(survey.buildSurveySchema()).rejects.toThrowError(EventNotFoundError);
    });
  });

  describe('saveSpeakerAnswer', () => {
    it('creates speaker survey answers for survey', async () => {
      const event = await eventFactory();
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

    it('saves speaker survey answers for survey', async () => {
      const event = await eventFactory();
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

  describe('getSpeakerAnswers', () => {
    it('returns the speaker answers for a survey', async () => {
      const event = await eventFactory();
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
      const event = await eventFactory();
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

  describe('getMultipleSpeakerAnswers', () => {
    it('returns multiple speaker answers for custom survey', async () => {
      const event1 = await eventFactory({
        traits: ['withSurveyConfig'],
        attributes: {
          surveyConfig: {
            enabled: true,
            questions: [
              { id: 'name', label: 'What is your name?', type: 'text', required: true },
              {
                id: 'gender',
                label: 'What is your gender?',
                type: 'radio',
                required: true,
                options: [
                  { id: 'male', label: 'Male' },
                  { id: 'female', label: 'Female' },
                ],
              },
              {
                id: 'diet',
                label: 'Dietary preferences',
                type: 'checkbox',
                required: true,
                options: [
                  { id: 'vegan', label: 'Vegan' },
                  { id: 'vegetarian', label: 'Vegetarian' },
                ],
              },
            ],
          },
        },
      });
      const event2 = await eventFactory({ traits: ['withSurveyConfig'] });
      const user1 = await userFactory();
      const user2 = await userFactory();
      await surveyFactory({
        user: user1,
        event: event1,
        attributes: { answers: { name: 'John Doe', gender: 'male', diet: ['vegan'] } },
      });
      await surveyFactory({
        user: user2,
        event: event1,
        attributes: { answers: { name: 'Jane Doe', gender: 'female', diet: ['vegetarian'] } },
      });
      await surveyFactory({
        user: user1,
        event: event2,
        attributes: { answers: { name: 'John Smith' } },
      });

      const answers = await SpeakerSurvey.for(event1.slug).getMultipleSpeakerAnswers(event1, [user1.id, user2.id]);

      expect(answers).toEqual({
        [user1.id]: [
          { id: 'name', label: 'What is your name?', type: 'text', answer: 'John Doe' },
          { id: 'gender', label: 'What is your gender?', type: 'radio', answers: [{ id: 'male', label: 'Male' }] },
          { id: 'diet', label: 'Dietary preferences', type: 'checkbox', answers: [{ id: 'vegan', label: 'Vegan' }] },
        ],
        [user2.id]: [
          { id: 'name', label: 'What is your name?', type: 'text', answer: 'Jane Doe' },
          {
            id: 'gender',
            label: 'What is your gender?',
            type: 'radio',
            answers: [{ id: 'female', label: 'Female' }],
          },
          {
            id: 'diet',
            label: 'Dietary preferences',
            type: 'checkbox',
            answers: [{ id: 'vegetarian', label: 'Vegetarian' }],
          },
        ],
      });
    });
  });
});
