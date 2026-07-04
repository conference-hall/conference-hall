import { z } from 'zod';
import { MESSAGE_MAX_LENGTH } from '~/shared/types/conversation.types.ts';

const ConversationChannelSchema = z.enum(['comment', 'speaker']);

export const ConversationMessageSaveSchema = z.object({
  id: z.string().optional(),
  message: z.string().min(1, 'A message is required').max(MESSAGE_MAX_LENGTH, 'The message is too long'),
});

export const ConversationMessageReactSchema = z.object({
  id: z.string(),
  code: z.string(),
});

export const ConversationMessageDeleteSchema = z.object({
  id: z.string(),
});

export const ConversationMessageSaveWithChannelSchema = ConversationMessageSaveSchema.extend({
  channel: ConversationChannelSchema,
});

export const ConversationMessageReactWithChannelSchema = ConversationMessageReactSchema.extend({
  channel: ConversationChannelSchema,
});

export const ConversationMessageDeleteWithChannelSchema = ConversationMessageDeleteSchema.extend({
  channel: ConversationChannelSchema,
});

export type ConversationMessageSaveData = z.infer<typeof ConversationMessageSaveSchema>;
export type ConversationMessageReactData = z.infer<typeof ConversationMessageReactSchema>;
export type ConversationMessageDeleteData = z.infer<typeof ConversationMessageDeleteSchema>;
