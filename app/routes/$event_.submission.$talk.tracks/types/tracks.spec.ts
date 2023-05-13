import { TracksUpdateSchema } from './tracks';
import { parse } from '@conform-to/zod';

describe('Validate TracksUpdateSchema', () => {
  it('validates tracks form inputs', async () => {
    const form = new FormData();
    form.append('formats', 'format 1');
    form.append('formats', 'format 2');
    form.append('categories', 'category 1');
    form.append('categories', 'category 2');

    const result = parse(form, { schema: TracksUpdateSchema });
    expect(result.value).toEqual({
      formats: ['format 1', 'format 2'],
      categories: ['category 1', 'category 2'],
    });
  });
});
