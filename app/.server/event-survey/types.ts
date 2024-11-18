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

export const LegacyEventSurveySettingsSchema = z.object({
  activeQuestions: z.array(z.string()),
});

export type SurveyRemoveQuestion = z.infer<typeof SurveyRemoveQuestionSchema>;
export type SurveyMoveQuestion = z.infer<typeof SurveyMoveQuestionSchema>;
export type SurveyConfigType = z.infer<typeof SurveyConfigSchema>;
export type SurveyQuestion = z.infer<typeof SurveyQuestionSchema>;
export type LegacyEventSurveyConfig = z.infer<typeof LegacyEventSurveySettingsSchema>;

// TODO: [survey] Create a schema builder from survey questions
export const SurveySchema = z.object({
  gender: z.string().trim().nullable().default(null),
  tshirt: z.string().trim().nullable().default(null),
  accomodation: z.string().trim().nullable().default(null),
  transports: z.array(z.string().trim()).nullable().optional(),
  diet: z.array(z.string().trim()).nullable().optional(),
  info: z.string().trim().nullable().default(null),
});

export type SurveyData = z.infer<typeof SurveySchema>;
