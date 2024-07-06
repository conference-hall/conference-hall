import { endOfDay, parse, startOfDay } from 'date-fns';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';
import { z } from 'zod';

export const INTERVALS = [5, 10, 15] as const;

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
    start: fromZonedTime(startOfDay(parse(start, 'yyyy-MM-dd', toZonedTime(new Date(), timezone))), timezone),
    end: fromZonedTime(endOfDay(parse(end, 'yyyy-MM-dd', toZonedTime(new Date(), timezone))), timezone),
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

// TODO: rename like sessions
export const ScheduleEditSchema = z.object({
  name: z.string().trim().min(1).max(255),
});

// TODO: rename like sessions
export const ScheduleTrackSaveSchema = z.object({
  id: z.string().trim().optional(),
  name: z.string().trim().min(1).max(255),
});

export const ScheduleDisplayTimesUpdateSchema = z
  .object({
    displayStartHour: z.number().min(0).max(23),
    displayEndHour: z.number().min(0).max(23),
  })
  .refine(
    ({ displayStartHour, displayEndHour }) => {
      if (displayStartHour > displayEndHour) return false;
      return true;
    },
    { path: ['displayStartHour'], message: 'Displayed start hour must be before end hour.' },
  );

export const ScheduleSessionCreateSchema = z.object({
  trackId: z.string(),
  start: z.coerce.date(),
  end: z.coerce.date(),
});

export const ScheduleSessionUpdateSchema = ScheduleSessionCreateSchema.extend({
  id: z.string(),
});

export type ScheduleEditData = z.infer<typeof ScheduleEditSchema>;
export type ScheduleCreateData = z.infer<typeof ScheduleCreateSchema>;
export type ScheduleTrackSaveData = z.infer<typeof ScheduleTrackSaveSchema>;
export type ScheduleSessionCreateData = z.infer<typeof ScheduleSessionCreateSchema>;
export type ScheduleSessionUpdateData = z.infer<typeof ScheduleSessionUpdateSchema>;
export type ScheduleDisplayTimesUpdateData = z.infer<typeof ScheduleDisplayTimesUpdateSchema>;
