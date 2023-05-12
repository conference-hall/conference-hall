import { z } from 'zod';
import { repeatable } from 'zod-form-data';

export const EventSurveySettingsSchema = z.object({
  surveyQuestions: repeatable(z.array(z.string())),
});
