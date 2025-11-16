import { parseWithZod } from '@conform-to/zod/v4';
import { z } from 'zod';

export const TagSaveSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1).max(50),
  color: z.string().trim().length(7),
});

export const TagDeleteSchema = z.object({ id: z.string() });

const TagFiltersSchema = z.object({
  query: z.string().trim().optional(),
});

export type TagSaveData = z.infer<typeof TagSaveSchema>;

export type TagFilters = z.infer<typeof TagFiltersSchema>;

export function parseUrlFilters(url: string) {
  const params = new URL(url).searchParams;
  const result = parseWithZod(params, { schema: TagFiltersSchema });
  if (result.status !== 'success') return {};
  return result.value;
}
