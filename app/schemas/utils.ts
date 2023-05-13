import { z } from 'zod';

type InputType<DefaultType extends z.ZodTypeAny> = {
  (): z.ZodEffects<DefaultType>;
  <ProvidedType extends z.ZodTypeAny>(schema: ProvidedType): z.ZodEffects<ProvidedType>;
};

// source from: https://github.com/airjp73/remix-validated-form
export const repeatable: InputType<z.ZodArray<any>> = (schema = z.array(z.string())) => {
  return z.preprocess((val) => {
    if (Array.isArray(val)) return val;
    if (val === undefined) return [];
    return [val];
  }, schema) as any;
};
