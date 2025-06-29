import { z } from 'zod';

export type LocaleEmailData = {
  locale: string;
};

export interface CustomEmailData {
  preview: boolean;
  customization: {
    subject?: string | null;
    content?: string | null;
  } | null;
}

export const CUSTOM_TEMPLATES = ['proposal-submitted', 'proposal-accepted', 'proposal-rejected'] as const;

export const CustomTemplateSchema = z.enum(['proposal-submitted', 'proposal-accepted', 'proposal-rejected']);

export type CustomTemplate = z.infer<typeof CustomTemplateSchema>;

export const EventEmailCustomUpsertSchema = z.object({
  template: CustomTemplateSchema,
  locale: z.string().min(2).max(5).default('en'),
  subject: z.string().trim().min(1).max(200).nullable().default(null),
  content: z.string().trim().min(1).max(5000).nullable().default(null),
});

export type EventEmailCustomUpsert = z.infer<typeof EventEmailCustomUpsertSchema>;

export const EventEmailCustomDeleteSchema = z.object({
  template: CustomTemplateSchema,
  locale: z.string().min(2).max(5).default('en'),
});

export type EventEmailCustomDelete = z.infer<typeof EventEmailCustomDeleteSchema>;
