import { z } from 'zod';

import { text } from '~/schemas/utils';
import { slugValidator } from '~/schemas/validators';

export const TeamSaveSchema = z.object({
  name: text(z.string().trim().min(3).max(50)),
  slug: text(slugValidator),
});

export type TeamSaveData = z.infer<typeof TeamSaveSchema>;
