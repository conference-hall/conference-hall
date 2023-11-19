import { parse } from '@conform-to/zod';

import { EventSurveySettingsSchema } from './event-survey-settings.schema.ts';

describe('Validate EventSurveySettingsSchema', () => {
  it('validates valid inputs', async () => {
    const form = new FormData();
    form.append('surveyQuestions', 'Question 1');
    form.append('surveyQuestions', 'Question 2');

    const result = parse(form, { schema: EventSurveySettingsSchema });
    expect(result.value).toEqual({ surveyQuestions: ['Question 1', 'Question 2'] });
  });
});
