import { z } from 'zod';

export const SubmissionPassCreateSchema = z.object({ label: z.string().trim().min(1).max(100) });

export const SubmissionPassDeleteSchema = z.object({ id: z.string() });

export type SubmissionPassCreateData = z.infer<typeof SubmissionPassCreateSchema>;
