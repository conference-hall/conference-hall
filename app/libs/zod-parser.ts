// Inspired by @conform-to/zod
// The original code is licensed under MIT
// See: https://github.com/edmundhung/conform

import type { output, ZodError, ZodType, ZodTypeAny } from 'zod';
import {
  any,
  lazy,
  ZodAny,
  ZodArray,
  ZodBigInt,
  ZodBoolean,
  ZodDate,
  ZodDefault,
  ZodDiscriminatedUnion,
  ZodEffects,
  ZodEnum,
  ZodIntersection,
  ZodLazy,
  ZodLiteral,
  ZodNativeEnum,
  ZodNullable,
  ZodNumber,
  ZodObject,
  ZodOptional,
  ZodPipeline,
  ZodString,
  ZodTuple,
  ZodUnion,
} from 'zod';

/**
 * Parse the provided Form data or URL search params with the provided Zod schema
 */
export function parseWithZod<Schema extends ZodTypeAny>(
  payload: FormData | URLSearchParams,
  schema: Schema,
):
  | {
      success: true;
      value: output<Schema>;
      error: {};
    }
  | {
      success: false;
      value: null;
      error: Record<string, string[]>;
    } {
  // Convert the payload to a plain object
  const data = resolve(payload);

  // Enable coercion and validation to the provided schema
  const enabledSchema = enableTypeCoercion(schema);

  // Parse the data and return the result
  const result = enabledSchema.safeParse(data);
  return {
    success: result.success,
    value: result.success ? result.data : null,
    error: !result.success ? getError(result.error) : {},
  };
}

function getError({ errors }: ZodError): Record<string, string[]> {
  return errors.reduce<Record<string, string[]>>((result, error) => {
    const name = formatPaths(error.path);
    const messages = result[name] ?? [];

    messages.push(error.message);

    result[name] = messages;

    return result;
  }, {});
}

function resolve(payload: FormData | URLSearchParams): Record<string, unknown> {
  const fields: string[] = [];
  const data: Record<string, unknown> = {};

  for (const [name, next] of payload.entries()) {
    fields.push(name);
    setValue(data, name, (prev) => {
      if (!prev) {
        return next;
      } else if (Array.isArray(prev)) {
        return prev.concat(next);
      } else {
        return [prev, next];
      }
    });
  }

  return data;
}

/**
 * Assign a value to a target object by following the paths
 */
function setValue(target: Record<string, any>, name: string, valueFn: (currentValue?: unknown) => unknown) {
  const paths = getPaths(name);
  const length = paths.length;
  const lastIndex = length - 1;

  let index = -1;
  let pointer = target;

  while (pointer != null && ++index < length) {
    const key = paths[index] as string | number;
    const nextKey = paths[index + 1];
    const newValue =
      index != lastIndex ? pointer[key] ?? (typeof nextKey === 'number' ? [] : {}) : valueFn(pointer[key]);

    pointer[key] = newValue;
    pointer = pointer[key];
  }
}

/**
 * Returns a formatted name from the paths based on the JS syntax convention
 * @example
 * ```js
 * const name = formatPaths(['todos', 0, 'content']); // "todos[0].content"
 * ```
 */
function formatPaths(paths: Array<string | number>): string {
  return paths.reduce<string>((name, path) => {
    if (typeof path === 'number') {
      return `${name}[${Number.isNaN(path) ? '' : path}]`;
    }

    if (name === '' || path === '') {
      return [name, path].join('');
    }

    return [name, path].join('.');
  }, '');
}

/**
 * Returns the paths from a name based on the JS syntax convention
 * @example
 * ```js
 * const paths = getPaths('todos[0].content'); // ['todos', 0, 'content']
 * ```
 */
function getPaths(name: string): Array<string | number> {
  if (!name) {
    return [];
  }

  return name.split(/\.|(\[\d*\])/).reduce<Array<string | number>>((result, segment) => {
    if (typeof segment !== 'undefined' && segment !== '') {
      if (segment.startsWith('[') && segment.endsWith(']')) {
        const index = segment.slice(1, -1);

        result.push(Number(index));
      } else {
        result.push(segment);
      }
    }
    return result;
  }, []);
}

/**
 * Helpers for coercing string value
 * Modify the value only if it's a string, otherwise return the value as-is
 */
function coerceString(value: unknown, transform?: (text: string) => unknown) {
  if (typeof value !== 'string') {
    return value;
  }

  if (value === '') {
    return undefined;
  }

  if (typeof transform !== 'function') {
    return value;
  }

  return transform(value);
}

/**
 * Helpers for coercing file
 * Modify the value only if it's a file, otherwise return the value as-is
 */
function coerceFile(file: unknown) {
  if (typeof File !== 'undefined' && file instanceof File && file.name === '' && file.size === 0) {
    return undefined;
  }

  return file;
}

/**
 * A file schema is usually defined as `z.instanceof(File)`
 * which is implemented based on ZodAny with `superRefine`
 * Check the `instanceOfType` function on zod for more info
 */
function isFileSchema(schema: ZodEffects<any, any, any>): boolean {
  if (typeof File === 'undefined') {
    return false;
  }

  return (
    schema._def.effect.type === 'refinement' &&
    schema.innerType() instanceof ZodAny &&
    schema.safeParse(new File([], '')).success &&
    !schema.safeParse('').success
  );
}

/**
 * Reconstruct the provided schema with additional preprocessing steps
 * This coerce empty values to undefined and transform strings to the correct type
 */
function enableTypeCoercion<Schema extends ZodTypeAny>(
  type: Schema,
  cache = new Map<ZodTypeAny, ZodTypeAny>(),
): ZodType<output<Schema>> {
  const result = cache.get(type);

  // Return the cached schema if it's already processed
  // This is to prevent infinite recursion caused by z.lazy()
  if (result) {
    return result;
  }

  let schema: ZodTypeAny = type;

  if (
    type instanceof ZodString ||
    type instanceof ZodLiteral ||
    type instanceof ZodEnum ||
    type instanceof ZodNativeEnum
  ) {
    schema = any()
      .transform((value) => coerceString(value))
      .pipe(type);
  } else if (type instanceof ZodNumber) {
    schema = any()
      .transform((value) => coerceString(value, Number))
      .pipe(type);
  } else if (type instanceof ZodBoolean) {
    schema = any()
      .transform((value) => coerceString(value, (text) => (text === 'on' ? true : text)))
      .pipe(type);
  } else if (type instanceof ZodDate) {
    schema = any()
      .transform((value) =>
        coerceString(value, (timestamp) => {
          const date = new Date(timestamp);

          // z.date() does not expose a quick way to set invalid_date error
          // This gets around it by returning the original string if it's invalid
          // See https://github.com/colinhacks/zod/issues/1526
          if (isNaN(date.getTime())) {
            return timestamp;
          }

          return date;
        }),
      )
      .pipe(type);
  } else if (type instanceof ZodBigInt) {
    schema = any()
      .transform((value) => coerceString(value, BigInt))
      .pipe(type);
  } else if (type instanceof ZodArray) {
    schema = any()
      .transform((value) => {
        // No preprocess needed if the value is already an array
        if (Array.isArray(value)) {
          return value;
        }

        if (typeof value === 'undefined' || typeof coerceFile(value) === 'undefined') {
          return [];
        }

        // Wrap it in an array otherwise
        return [value];
      })
      .pipe(
        new ZodArray({
          ...type._def,
          type: enableTypeCoercion(type.element, cache),
        }),
      );
  } else if (type instanceof ZodObject) {
    const shape = Object.fromEntries(
      Object.entries(type.shape).map(([key, def]) => [
        key,
        // @ts-expect-error see message above
        enableTypeCoercion(def, cache),
      ]),
    );
    schema = new ZodObject({
      ...type._def,
      shape: () => shape,
    });
  } else if (type instanceof ZodEffects) {
    if (isFileSchema(type)) {
      schema = any()
        .transform((value) => coerceFile(value))
        .pipe(type);
    } else {
      schema = new ZodEffects({
        ...type._def,
        schema: enableTypeCoercion(type.innerType(), cache),
      });
    }
  } else if (type instanceof ZodOptional) {
    schema = any()
      .transform((value) => coerceFile(coerceString(value)))
      .pipe(
        new ZodOptional({
          ...type._def,
          innerType: enableTypeCoercion(type.unwrap(), cache),
        }),
      );
  } else if (type instanceof ZodDefault) {
    schema = any()
      .transform((value) => coerceFile(coerceString(value)))
      .pipe(
        new ZodDefault({
          ...type._def,
          innerType: enableTypeCoercion(type.removeDefault(), cache),
        }),
      );
  } else if (type instanceof ZodIntersection) {
    schema = new ZodIntersection({
      ...type._def,
      left: enableTypeCoercion(type._def.left, cache),
      right: enableTypeCoercion(type._def.right, cache),
    });
  } else if (type instanceof ZodUnion) {
    schema = new ZodUnion({
      ...type._def,
      options: type.options.map((option: ZodTypeAny) => enableTypeCoercion(option, cache)),
    });
  } else if (type instanceof ZodDiscriminatedUnion) {
    schema = new ZodDiscriminatedUnion({
      ...type._def,
      options: type.options.map((option: ZodTypeAny) => enableTypeCoercion(option, cache)),
    });
  } else if (type instanceof ZodTuple) {
    schema = new ZodTuple({
      ...type._def,
      items: type.items.map((item: ZodTypeAny) => enableTypeCoercion(item, cache)),
    });
  } else if (type instanceof ZodNullable) {
    schema = new ZodNullable({
      ...type._def,
      innerType: enableTypeCoercion(type.unwrap(), cache),
    });
  } else if (type instanceof ZodPipeline) {
    schema = new ZodPipeline({
      ...type._def,
      in: enableTypeCoercion(type._def.in, cache),
      out: enableTypeCoercion(type._def.out, cache),
    });
  } else if (type instanceof ZodLazy) {
    schema = lazy(() => enableTypeCoercion(type.schema, cache));
  }

  if (type !== schema) {
    cache.set(type, schema);
  }

  return schema;
}
