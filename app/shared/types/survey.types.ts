import type z from 'zod';
import type { SurveyQuestionSchema } from '~/features/event-management/settings/models/survey-config.ts';

export type SurveyDetailedAnswer =
  | {
      id: string;
      label: string;
      type: 'text';
      answer: string | null;
    }
  | {
      id: string;
      label: string;
      type: 'radio';
      answers: Array<{ id: string; label: string }>;
    }
  | {
      id: string;
      label: string;
      type: 'checkbox';
      answers: Array<{ id: string; label: string }>;
    };

export type SurveyQuestion = z.infer<typeof SurveyQuestionSchema>;
