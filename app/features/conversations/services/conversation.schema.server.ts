import { z } from 'zod';

export const ConversationMessageCreateSchema = z.object({
  message: z.string().min(1, 'A message is required').max(500),
});

export type ConversationMessageCreateData = z.infer<typeof ConversationMessageCreateSchema>;
