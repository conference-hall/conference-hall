import { z } from 'zod';

export const ReviewUpdateDataSchema = z.object({
  note: z.number().min(0).max(5).nullable().default(null),
  feeling: z.enum(['NEUTRAL', 'POSITIVE', 'NEGATIVE', 'NO_OPINION']),
});

export type ReviewUpdateData = z.infer<typeof ReviewUpdateDataSchema>;

export const CommentReactionSchema = z.object({ commentId: z.string(), code: z.string() });

export type CommentReactionData = z.infer<typeof CommentReactionSchema>;
