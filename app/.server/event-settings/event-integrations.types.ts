import { z } from 'zod';

export const OpenPlannerConfigSchema = z.object({
  eventId: z.string().trim().min(1).max(255),
  apiKey: z.string().trim().min(1).max(255),
});

export const EventIntegrationConfigSchema = z.discriminatedUnion('name', [
  z.object({
    id: z.string().optional(),
    name: z.literal('OPEN_PLANNER'),
    configuration: OpenPlannerConfigSchema,
  }),
]);

export type OpenPlannerConfig = z.infer<typeof OpenPlannerConfigSchema>;
export type EventIntegrationConfigData = z.infer<typeof EventIntegrationConfigSchema>;
