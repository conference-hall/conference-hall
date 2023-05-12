import { withZod } from '@remix-validated-form/with-zod';
import { EventTrackSaveSchema } from './event-track-save.schema';

describe('Validate EventTrackSaveSchema', () => {
  it('validates valid inputs', async () => {
    const formData = new FormData();
    formData.append('id', '123');
    formData.append('name', 'Track 1');
    formData.append('description', 'Track description');

    const result = await withZod(EventTrackSaveSchema).validate(formData);
    expect(result.data).toEqual({
      id: '123',
      name: 'Track 1',
      description: 'Track description',
    });
  });

  it('validates valid inputs without id', async () => {
    const formData = new FormData();
    formData.append('name', 'Track 1');
    formData.append('description', 'Track description');

    const result = await withZod(EventTrackSaveSchema).validate(formData);
    expect(result.data).toEqual({
      name: 'Track 1',
      description: 'Track description',
    });
  });

  it('returns validation errors', async () => {
    const formData = new FormData();
    formData.append('name', '');
    formData.append('description', '');

    const result = await withZod(EventTrackSaveSchema).validate(formData);
    expect(result.error?.fieldErrors).toEqual({
      name: 'Required',
    });
  });
});
