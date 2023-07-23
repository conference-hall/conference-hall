import { z } from 'zod';

import { repeatable } from '~/routes/__types/utils';

export const EventSurveySettingsSchema = z.object({
  surveyQuestions: repeatable(),
});
