import { z } from 'zod';

import { text } from '~/routes/__types/utils';
import { slugValidator } from '~/routes/__types/validators';

export const TeamSaveSchema = z.object({
  name: text(z.string().trim().min(3).max(50)),
  slug: text(slugValidator),
});

export type TeamSaveData = z.infer<typeof TeamSaveSchema>;
