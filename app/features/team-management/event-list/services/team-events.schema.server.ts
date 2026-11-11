import { z } from 'zod';

export const TeamEventsStatusSchema = z.enum(['active', 'archived', 'all']).catch('active');
export type TeamEventsStatus = z.infer<typeof TeamEventsStatusSchema>;
