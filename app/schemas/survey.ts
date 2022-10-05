import { z } from 'zod';
import { repeatable, text } from 'zod-form-data';

export type SurveyQuestions = Array<{
  name: string;
  label: string;
  type: 'text' | 'checkbox' | 'radio';
  answers?: Array<{ name: string; label: string }>;
}>;

export const SurveySchema = z.object({
  gender: text(z.string().trim().nullable().default(null)),
  tshirt: text(z.string().trim().nullable().default(null)),
  accomodation: text(z.string().trim().nullable().default(null)),
  transports: repeatable(z.array(z.string().trim()).nullable()).optional(),
  diet: repeatable(z.array(z.string().trim()).nullable()).optional(),
  info: text(z.string().trim().nullable().default(null)),
});

export type SurveyData = z.infer<typeof SurveySchema>;
