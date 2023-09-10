import { z } from 'zod';

export type SurveyQuestions = Array<{
  name: string;
  label: string;
  type: 'text' | 'checkbox' | 'radio';
  answers?: Array<{ name: string; label: string }>;
}>;

export const SurveySchema = z.object({
  gender: z.string().trim().nullable().default(null),
  tshirt: z.string().trim().nullable().default(null),
  accomodation: z.string().trim().nullable().default(null),
  transports: z.array(z.string().trim()).nullable().optional(),
  diet: z.array(z.string().trim()).nullable().optional(),
  info: z.string().trim().nullable().default(null),
});

export type SurveyData = z.infer<typeof SurveySchema>;
