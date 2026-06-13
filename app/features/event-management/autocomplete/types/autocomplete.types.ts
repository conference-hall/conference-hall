import { parseWithZod } from '@conform-to/zod/v4';
import { z } from 'zod';

const AutocompleteKindSchema = z.enum(['proposals', 'speakers']);

const AutocompleteFilterSchema = z.object({
  query: z.string().optional(),
  kind: z.array(AutocompleteKindSchema),
});

export type AutocompleteFilters = z.infer<typeof AutocompleteFilterSchema>;

export type ProposalResult = {
  kind: 'proposals';
  id: string; // real proposal id (used by the schedule to persist proposalId)
  routeId: string; // URL slug (used for navigation / "see proposal" link)
  title: string;
  speakers: Array<{ name: string | null; picture: string | null }>;
};

export type SpeakerResult = {
  kind: 'speakers';
  id: string; // real speaker id (used for navigation)
  name: string | null;
  company: string | null;
  picture: string | null;
};

export type AutocompleteResult = ProposalResult | SpeakerResult;

export function parseUrlFilters(url: URL) {
  const params = url.searchParams;
  const result = parseWithZod(params, { schema: AutocompleteFilterSchema });
  if (result.status !== 'success') return { kind: [] };
  return result.value;
}
