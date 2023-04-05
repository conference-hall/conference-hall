import { withZod } from '@remix-validated-form/with-zod';
import { TracksUpdateSchema } from './tracks';

describe('Validate TracksUpdateSchema', () => {
  it('validates tracks form inputs', async () => {
    const formData = new FormData();
    formData.append('formats', 'format 1');
    formData.append('formats', 'format 2');
    formData.append('categories', 'category 1');
    formData.append('categories', 'category 2');

    const result = await withZod(TracksUpdateSchema).validate(formData);
    expect(result.data).toEqual({
      formats: ['format 1', 'format 2'],
      categories: ['category 1', 'category 2'],
    });
  });
});
