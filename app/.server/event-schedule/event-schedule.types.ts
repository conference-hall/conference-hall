import { z } from 'zod';

import { zodNumberEnum } from '~/libs/validators/zod-number-enum.ts';

export const INTERVALS = [5, 10, 15] as const;

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

export type ScheduleTrackSaveData = z.infer<typeof ScheduleTrackSaveSchema>;
export type ScheduleSettingsData = z.infer<typeof ScheduleSettingsDataSchema>;
