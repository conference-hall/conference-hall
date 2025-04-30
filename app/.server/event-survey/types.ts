import { z } from 'zod';

export const SurveyRemoveQuestionSchema = z.object({ id: z.string() });

export const SurveyMoveQuestionSchema = z.object({ id: z.string(), direction: z.enum(['up', 'down']) });

export const SurveyQuestionSchema = z.object({
  id: z.string(),
  label: z.string().min(1).max(255),
  type: z.enum(['radio', 'checkbox', 'text']),
  options: z.array(z.object({ id: z.string(), label: z.string() })).optional(),
  required: z.boolean().default(false),
});

export const SurveyConfigSchema = z.object({
  enabled: z.boolean(),
  questions: z.array(SurveyQuestionSchema),
});

export type SurveyMoveQuestion = z.infer<typeof SurveyMoveQuestionSchema>;
export type SurveyConfigType = z.infer<typeof SurveyConfigSchema>;
export type SurveyQuestion = z.infer<typeof SurveyQuestionSchema>;

export type SurveyRawAnswers = Record<string, string | string[] | null>;

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
