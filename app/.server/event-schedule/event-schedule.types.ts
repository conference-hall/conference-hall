import { z } from 'zod';

import { parseToUtcEndOfDay, parseToUtcStartOfDay } from '~/libs/datetimes/timezone.ts';

export const ScheduleCreateSchema = z
  .object({
    name: z.string().trim().min(1).max(255),
    timezone: z.string(),
    start: z.string(),
    end: z.string(),
  })
  .transform(({ start, end, timezone, ...rest }) => ({
    ...rest,
    timezone,
    start: parseToUtcStartOfDay(start, timezone, 'yyyy-MM-dd'),
    end: parseToUtcEndOfDay(end, timezone, 'yyyy-MM-dd'),
  }))
  .refine(
    ({ start, end }) => {
      if (start && !end) return false;
      if (end && !start) return false;
      if (start && end && start > end) return false;
      return true;
    },
    { path: ['start'], message: 'Schedule start date must be before the end date.' },
  );

export const ScheduleTracksSaveSchema = z.object({
  tracks: z.array(z.object({ id: z.string().trim(), name: z.string().trim() })),
});

export const ScheduleDisplayTimesUpdateSchema = z
  .object({
    displayStartMinutes: z.coerce
      .number()
      .min(0)
      .max(23 * 60),
    displayEndMinutes: z.coerce
      .number()
      .min(0)
      .max(23 * 60),
  })
  .refine(({ displayStartMinutes, displayEndMinutes }) => displayStartMinutes <= displayEndMinutes, {
    path: ['displayStartMinutes'],
    message: 'Displayed start in minutes must be before end in minutes.',
  });

export const ScheduleSessionCreateSchema = z.object({
  trackId: z.string(),
  start: z.coerce.date(),
  end: z.coerce.date(),
});

export const ScheduleSessionUpdateSchema = ScheduleSessionCreateSchema.extend({
  id: z.string(),
  name: z.string().trim().optional(),
  color: z.string(),
  emojis: z.array(z.string()),
  language: z.string().trim().optional(),
  proposalId: z.string().optional(),
});

export const SchedulSessionIdSchema = z.string();

export type ScheduleCreateData = z.infer<typeof ScheduleCreateSchema>;
export type ScheduleTracksSaveData = z.infer<typeof ScheduleTracksSaveSchema>;
export type ScheduleSessionCreateData = z.infer<typeof ScheduleSessionCreateSchema>;
export type ScheduleSessionUpdateData = z.infer<typeof ScheduleSessionUpdateSchema>;
