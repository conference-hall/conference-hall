import { z } from 'zod';

// source from: https://github.com/airjp73/remix-validated-form
type InputType<DefaultType extends z.ZodTypeAny> = {
  (): z.ZodEffects<DefaultType>;
  <ProvidedType extends z.ZodTypeAny>(schema: ProvidedType): z.ZodEffects<ProvidedType>;
};

const stripEmpty = z.literal('').transform(() => undefined);

const preprocessIfValid = (schema: z.ZodTypeAny) => (val: unknown) => {
  const result = schema.safeParse(val);
  if (result.success) return result.data;
  return val;
};

export const text: InputType<z.ZodString> = (schema = z.string().trim()) =>
  z.preprocess(preprocessIfValid(stripEmpty), schema) as any;

export const repeatable: InputType<z.ZodArray<any>> = (schema = z.array(text())) => {
  return z.preprocess((val) => {
    if (Array.isArray(val)) return val;
    if (val === undefined) return [];
    return [val];
  }, schema) as any;
};

export const numeric: InputType<z.ZodNumber> = (schema = z.number()) =>
  z.preprocess(
    preprocessIfValid(
      z.union([
        stripEmpty,
        z
          .string()
          .trim()
          .transform((val) => Number(val))
          .refine((val) => !Number.isNaN(val)),
      ]),
    ),
    schema,
  ) as any;
