import { z } from 'zod';

import { zodNumberEnum } from '~/libs/validators/zod-number-enum.ts';

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

// TODO: check endTimeslot is after startTimeslot
export const ScheduleSettingsDataSchema = z.object({
  name: z.string().trim().min(1).max(255),
  startTimeslot: z.string().trim().min(1).max(5),
  endTimeslot: z.string().trim().min(1).max(5),
  intervalMinutes: z.coerce.number().superRefine(zodNumberEnum(INTERVALS)),
});

export const ScheduleTrackSaveSchema = z.object({
  id: z.string().trim().optional(),
  name: z.string().trim().min(1).max(255),
});

export type ScheduleEditData = z.infer<typeof ScheduleEditSchema>;
export type ScheduleCreateData = z.infer<typeof ScheduleCreateSchema>;
export type ScheduleTrackSaveData = z.infer<typeof ScheduleTrackSaveSchema>;
export type ScheduleSettingsData = z.infer<typeof ScheduleSettingsDataSchema>;
