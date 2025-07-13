import { z } from 'zod/v4';

export const OpenPlannerConfigSchema = z.object({
  eventId: z.string().trim().min(1).max(255),
  apiKey: z.string().trim().min(1).max(255),
});

export const UpdateIntegrationConfigSchema = z.discriminatedUnion('name', [
  z.object({
    id: z.string().optional(),
    name: z.literal('OPEN_PLANNER'),
    ...OpenPlannerConfigSchema.shape,
  }),
]);

export const IntegrationConfigSchema = z.discriminatedUnion('name', [
  z.object({
    id: z.string().optional(),
    name: z.literal('OPEN_PLANNER'),
    configuration: OpenPlannerConfigSchema,
  }),
]);

export type IntegrationConfigData = z.infer<typeof IntegrationConfigSchema>;
