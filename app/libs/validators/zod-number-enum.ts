import { z } from 'zod';

// TODO: Add tests
export function zodNumberEnum<T extends number>(values: readonly T[]) {
  const set = new Set<unknown>(values);
  return (v: number, ctx: z.RefinementCtx): v is T => {
    if (!set.has(v)) {
      ctx.addIssue({
        code: z.ZodIssueCode.invalid_enum_value,
        received: v,
        options: [...values],
      });
    }
    return z.NEVER;
  };
}
