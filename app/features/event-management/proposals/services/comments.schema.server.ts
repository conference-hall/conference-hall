import { z } from 'zod';

export const CommentCreateSchema = z.object({
  message: z.string().min(1, 'A message is required').max(500),
});

export const CommentReactionSchema = z.object({ commentId: z.string(), code: z.string() });

export type CommentCreateData = z.infer<typeof CommentCreateSchema>;
export type CommentReactionData = z.infer<typeof CommentReactionSchema>;
