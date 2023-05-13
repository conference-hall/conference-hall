import { z } from 'zod';
import { text } from '~/schemas/utils';

export const EventTrackSaveSchema = z.object({
  id: text(z.string().trim().optional()),
  name: text(z.string().trim().min(1)),
  description: text(z.string().trim().nullable().default(null)),
});

export type EventTrackSaveData = z.infer<typeof EventTrackSaveSchema>;
