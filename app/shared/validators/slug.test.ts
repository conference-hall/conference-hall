import { SlugSchema } from './slug.ts';

describe('Slug schema for Zod', () => {
  it('validates a correct slug', () => {
    const result = SlugSchema.safeParse('devfest-nantes-01');
    expect(result.success).toBe(true);
  });

  it('returns error when slug is invalid', () => {
    const result = SlugSchema.safeParse('devfest/nantes 01');
    expect(result.success).toBe(false);
    expect(result.error?.errors.at(0)?.message).toEqual('Must only contain lower case alphanumeric and dashes (-).');
  });

  it('returns error when slug is a reserved word', () => {
    const result = SlugSchema.safeParse('new');
    expect(result.success).toBe(false);
    expect(result.error?.errors.at(0)?.message).toEqual('This URL is reserved.');
  });
});
