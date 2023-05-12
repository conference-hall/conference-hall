import { withZod } from '@remix-validated-form/with-zod';
import { EventSurveySettingsSchema } from './event-survey-settings.schema';

describe('Validate EventSurveySettingsSchema', () => {
  it('validates valid inputs', async () => {
    const formData = new FormData();
    formData.append('surveyQuestions', 'Question 1');
    formData.append('surveyQuestions', 'Question 2');

    const result = await withZod(EventSurveySettingsSchema).validate(formData);
    expect(result.data).toEqual({ surveyQuestions: ['Question 1', 'Question 2'] });
  });
});
