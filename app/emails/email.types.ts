import { z } from 'zod';

// todo(email): apply it to all emails
export type LocaleEmailData = {
  locale: string;
};

export interface CustomEmailData {
  customization: {
    subject?: string;
    content?: string;
  } | null;
}

export const CUSTOM_TEMPLATES = ['proposal-submitted', 'proposal-accepted', 'proposal-declined'] as const;

export const CustomTemplateSchema = z.enum(['proposal-submitted', 'proposal-accepted', 'proposal-declined']);

export type CustomTemplate = z.infer<typeof CustomTemplateSchema>;

export const EventEmailCustomizationSchema = z.object({
  template: CustomTemplateSchema,
  locale: z.string().min(2).max(5).default('en'),
  subject: z.string().trim().min(1).max(200).nullable().default(null),
  content: z.string().trim().min(1).max(5000).nullable().default(null),
});

export type EventEmailCustomization = z.infer<typeof EventEmailCustomizationSchema>;
