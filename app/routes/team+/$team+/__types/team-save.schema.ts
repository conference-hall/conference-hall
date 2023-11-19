import { z } from 'zod';

import { slugValidator } from '~/routes/__types/validators.ts';

export const TeamSaveSchema = z.object({
  name: z.string().trim().min(3).max(50),
  slug: slugValidator,
});

export type TeamSaveData = z.infer<typeof TeamSaveSchema>;
