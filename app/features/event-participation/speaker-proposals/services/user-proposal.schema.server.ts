import { z } from 'zod';
import { TalkSaveSchema } from '~/features/speaker/talk-library/services/talks-library.schema.server.ts';

const ProposalSaveSchema = TalkSaveSchema.extend({
  formats: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
});

export const ProposalParticipationSchema = z.object({
  participation: z.enum(['CONFIRMED', 'DECLINED']),
});

export function getProposalUpdateSchema(formatsRequired: boolean, categoriesRequired: boolean) {
  const FormatsSchema = formatsRequired ? z.array(z.string()).nonempty() : z.array(z.string()).optional();
  const CategoriesSchema = categoriesRequired ? z.array(z.string()).nonempty() : z.array(z.string()).optional();

  return TalkSaveSchema.extend({ formats: FormatsSchema, categories: CategoriesSchema });
}

export type ProposalSaveData = z.infer<typeof ProposalSaveSchema>;
