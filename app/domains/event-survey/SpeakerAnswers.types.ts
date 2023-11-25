import { z } from 'zod';

export const SurveySchema = z.object({
  gender: z.string().trim().nullable().default(null),
  tshirt: z.string().trim().nullable().default(null),
  accomodation: z.string().trim().nullable().default(null),
  transports: z.array(z.string().trim()).nullable().optional(),
  diet: z.array(z.string().trim()).nullable().optional(),
  info: z.string().trim().nullable().default(null),
});

export type SurveyData = z.infer<typeof SurveySchema>;
