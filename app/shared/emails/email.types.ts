import { z } from 'zod/v4';

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

export const CUSTOM_EMAIL_TEMPLATES = [
  'speakers-proposal-submitted',
  'speakers-proposal-accepted',
  'speakers-proposal-rejected',
] as const;

export type CustomTemplateName = (typeof CUSTOM_EMAIL_TEMPLATES)[number];

export const CustomTemplateSchema = z.enum(CUSTOM_EMAIL_TEMPLATES);

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
