import { z } from 'zod';

export const CommentSaveSchema = z.object({
  id: z.string().optional(),
  message: z.string().min(1, 'A message is required').max(500),
});

export const CommentReactionSchema = z.object({ id: z.string(), code: z.string() });

export type CommentSaveData = z.infer<typeof CommentSaveSchema>;
export type CommentReactionData = z.infer<typeof CommentReactionSchema>;
