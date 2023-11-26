import { z } from 'zod';

export const EventTypeSchema = z.enum(['CONFERENCE', 'MEETUP']);

export const EventVisibilitySchema = z.enum(['PUBLIC', 'PRIVATE']);

export type EventType = z.infer<typeof EventTypeSchema>;

export type EventVisibility = z.infer<typeof EventVisibilitySchema>;
