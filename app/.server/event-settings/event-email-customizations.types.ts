import { z } from 'zod';

const EmailTypeSchema = z.enum(['PROPOSAL_SUBMITTED', 'PROPOSAL_ACCEPTED', 'PROPOSAL_DECLINED']);

export const EventEmailCustomizationSchema = z.object({
  emailType: EmailTypeSchema,
  locale: z.string().min(2).max(5).default('en'),
  subject: z.string().trim().min(1).max(200).nullable().default(null),
  content: z.string().trim().min(1).max(5000).nullable().default(null),
  signature: z.string().trim().min(1).max(1000).nullable().default(null),
});

export type EmailType = z.infer<typeof EmailTypeSchema>;
export type EventEmailCustomization = z.infer<typeof EventEmailCustomizationSchema>;
