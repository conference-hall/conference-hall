import { z } from 'zod';

export const INTERVALS = [5, 10, 15] as const;

export const ScheduleCreateSchema = z
  .object({
    name: z.string().trim().min(1).max(255),
    start: z.coerce.date(),
    end: z.coerce.date(),
  })
  .refine(
    ({ start, end }) => {
      if (start && !end) return false;
      if (end && !start) return false;
      if (start && end && start > end) return false;
      return true;
    },
    { path: ['startDate'], message: 'Schedule start date must be after the end date.' },
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
