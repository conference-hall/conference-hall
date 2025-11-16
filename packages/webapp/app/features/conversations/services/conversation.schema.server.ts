import { z } from 'zod';

export const ConversationMessageSaveSchema = z.object({
  id: z.string().optional(),
  message: z.string().min(1, 'A message is required').max(500),
});

export const ConversationMessageReactSchema = z.object({
  id: z.string(),
  code: z.string(),
});

export const ConversationMessageDeleteSchema = z.object({
  id: z.string(),
});

export type ConversationMessageSaveData = z.infer<typeof ConversationMessageSaveSchema>;
export type ConversationMessageReactData = z.infer<typeof ConversationMessageReactSchema>;
export type ConversationMessageDeleteData = z.infer<typeof ConversationMessageDeleteSchema>;
