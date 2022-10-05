import { z } from 'zod';
import { text } from 'zod-form-data';
import { slugValidator } from '~/schemas/validators';

export const OrganizationSaveSchema = z.object({
  name: text(z.string().trim().min(3).max(50)),
  slug: text(slugValidator),
});

export type OrganizationSaveData = z.infer<typeof OrganizationSaveSchema>;
