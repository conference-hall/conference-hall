import { z } from 'zod';
import { text } from 'zod-form-data';
import { slugValidator } from '~/schemas/validators';

export type OrganizationSaveData = z.infer<typeof OrganizationSaveSchema>;

export const OrganizationSaveSchema = z.object({
  name: z.string().trim().min(3).max(50),
  slug: text(slugValidator),
});
