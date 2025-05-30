import { z } from 'zod';

export const OpenPlannerConfigSchema = z.object({
  eventId: z.string().trim().min(1).max(255),
  apiKey: z.string().trim().min(1).max(255),
});

const OpenAiConfigSchema = z.object({
  apiKey: z.string().trim().min(1).max(255),
});

export const UpdateIntegrationConfigSchema = z.discriminatedUnion('name', [
  z
    .object({
      id: z.string().optional(),
      name: z.literal('OPEN_PLANNER'),
    })
    .merge(OpenPlannerConfigSchema),
  z
    .object({
      id: z.string().optional(),
      name: z.literal('OPEN_AI'),
    })
    .merge(OpenAiConfigSchema),
]);

export const IntegrationConfigSchema = z.discriminatedUnion('name', [
  z.object({
    id: z.string().optional(),
    name: z.literal('OPEN_PLANNER'),
    configuration: OpenPlannerConfigSchema,
  }),
  z.object({
    id: z.string().optional(),
    name: z.literal('OPEN_AI'),
    configuration: OpenAiConfigSchema,
  }),
]);

export type IntegrationConfigData = z.infer<typeof IntegrationConfigSchema>;
