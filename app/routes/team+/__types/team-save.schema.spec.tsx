import { parse } from '@conform-to/zod';

import { TeamSaveSchema } from './team-save.schema';

describe('Validate TeamSaveSchema', () => {
  it('validates the team data', async () => {
    const form = new FormData();
    form.append('name', 'Hello world');
    form.append('slug', 'hello-world-1');

    const result = parse(form, { schema: TeamSaveSchema });
    expect(result.value).toEqual({ name: 'Hello world', slug: 'hello-world-1' });
  });

  it('returns errors when data too small', async () => {
    const form = new FormData();
    form.append('name', 'H');
    form.append('slug', 'h');

    const result = parse(form, { schema: TeamSaveSchema });
    expect(result?.error.name).toBe('String must contain at least 3 character(s)');
    expect(result?.error.slug).toBe('String must contain at least 3 character(s)');
  });

  it('validates slug format (alpha-num and dash only)', async () => {
    const form = new FormData();
    form.append('name', 'Hello world');
    form.append('slug', 'Hello world/');

    const result = parse(form, { schema: TeamSaveSchema });
    expect(result?.error.slug).toEqual('Must only contain lower case alphanumeric and dashes (-).');
  });
});
