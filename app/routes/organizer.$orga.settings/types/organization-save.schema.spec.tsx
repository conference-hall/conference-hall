import { withZod } from '@remix-validated-form/with-zod';
import { OrganizationSaveSchema } from './organization-save.schema';

describe('Validate OrganizationSaveSchema', () => {
  it('validates the organization data', async () => {
    const formData = new FormData();
    formData.append('name', 'Hello world');
    formData.append('slug', 'hello-world-1');

    const result = await withZod(OrganizationSaveSchema).validate(formData);
    expect(result.data).toEqual({ name: 'Hello world', slug: 'hello-world-1' });
  });

  it('returns errors when data too small', async () => {
    const formData = new FormData();
    formData.append('name', 'H');
    formData.append('slug', 'h');

    const result = await withZod(OrganizationSaveSchema).validate(formData);
    expect(result?.error?.fieldErrors.name).toBe('String must contain at least 3 character(s)');
    expect(result?.error?.fieldErrors.slug).toBe('String must contain at least 3 character(s)');
  });

  it('validates slug format (alpha-num and dash only)', async () => {
    const formData = new FormData();
    formData.append('name', 'Hello world');
    formData.append('slug', 'Hello world/');

    const result = await withZod(OrganizationSaveSchema).validate(formData);
    expect(result?.error?.fieldErrors.slug).toEqual('Must only contain lower case alphanumeric and dashes (-).');
  });
});
