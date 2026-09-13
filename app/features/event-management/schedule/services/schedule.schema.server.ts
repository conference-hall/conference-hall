import { z } from 'zod';
import { parseToUtcEndOfDay, parseToUtcStartOfDay } from '~/shared/datetimes/timezone.ts';

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
    start: parseToUtcStartOfDay(start, timezone),
    end: parseToUtcEndOfDay(end, timezone),
  }))
  .refine(
    ({ start, end }) => {
      if (start && !end) return false;
      if (end && !start) return false;
      if (start && end && start > end) return false;
      return true;
    },
    { path: ['start'], error: 'Schedule start date must be before the end date.' },
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
    error: 'Displayed start in minutes must be before end in minutes.',
  });

const ScheduleSessionSchema = z.object({
  trackId: z.string(),
  start: z.coerce.date(),
  end: z.coerce.date(),
  name: z.string().trim().optional(),
  color: z.string().optional(),
  emojis: z.array(z.string()).optional(),
  language: z.string().trim().optional(),
  proposalId: z.string().optional(),
});

const isTimeSlotOrdered = ({ start, end }: { start: Date; end: Date }) => start < end;
const timeSlotError = { path: ['start'], error: 'Session start must be before the end.' };

export const ScheduleSessionCreateSchema = ScheduleSessionSchema.refine(isTimeSlotOrdered, timeSlotError);

export const ScheduleSessionUpdateSchema = ScheduleSessionSchema.extend({ id: z.string() }).refine(
  isTimeSlotOrdered,
  timeSlotError,
);

export const ScheduleSessionsSwitchSchema = z.object({
  sourceId: z.string(),
  targetId: z.string(),
});

export const SchedulSessionIdSchema = z.string();

export type ScheduleCreateData = z.infer<typeof ScheduleCreateSchema>;
export type ScheduleDisplayTimesUpdateData = z.infer<typeof ScheduleDisplayTimesUpdateSchema>;
export type ScheduleTracksSaveData = z.infer<typeof ScheduleTracksSaveSchema>;
export type ScheduleSessionCreateData = z.infer<typeof ScheduleSessionCreateSchema>;
export type ScheduleSessionUpdateData = z.infer<typeof ScheduleSessionUpdateSchema>;
