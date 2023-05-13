import { z } from 'zod';

import { repeatable } from '~/schemas/utils';

export const EventSurveySettingsSchema = z.object({
  surveyQuestions: repeatable(),
});
