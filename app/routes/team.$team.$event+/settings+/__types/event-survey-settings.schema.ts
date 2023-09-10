import { z } from 'zod';

export const EventSurveySettingsSchema = z.object({
  surveyQuestions: z.array(z.string()),
});
