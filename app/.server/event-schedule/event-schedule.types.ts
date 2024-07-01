import { z } from 'zod';

export const INTERVALS = [5, 10, 15] as const;

export const ScheduleCreateSchema = z
  .object({
    name: z.string().trim().min(1).max(255),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
  })
  .refine(
    ({ startDate, endDate }) => {
      if (startDate && !endDate) return false;
      if (endDate && !startDate) return false;
      if (startDate && endDate && startDate > endDate) return false;
      return true;
    },
    { path: ['startDate'], message: 'Schedule start date must be after the end date.' },
  );

export const ScheduleEditSchema = z.object({
  name: z.string().trim().min(1).max(255),
});

export const ScheduleTrackSaveSchema = z.object({
  id: z.string().trim().optional(),
  name: z.string().trim().min(1).max(255),
});

export const ScheduleSessionSaveSchema = z.object({
  trackId: z.string(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
});

export type ScheduleEditData = z.infer<typeof ScheduleEditSchema>;
export type ScheduleCreateData = z.infer<typeof ScheduleCreateSchema>;
export type ScheduleTrackSaveData = z.infer<typeof ScheduleTrackSaveSchema>;
export type ScheduleSessionSaveData = z.infer<typeof ScheduleSessionSaveSchema>;
