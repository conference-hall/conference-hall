import { EventTrackSaveSchema } from './event-track-save.schema';
import { parse } from '@conform-to/zod';

describe('Validate EventTrackSaveSchema', () => {
  it('validates valid inputs', async () => {
    const form = new FormData();
    form.append('id', '123');
    form.append('name', 'Track 1');
    form.append('description', 'Track description');

    const result = parse(form, { schema: EventTrackSaveSchema });
    expect(result.value).toEqual({
      id: '123',
      name: 'Track 1',
      description: 'Track description',
    });
  });

  it('validates valid inputs without id', async () => {
    const form = new FormData();
    form.append('name', 'Track 1');
    form.append('description', 'Track description');

    const result = parse(form, { schema: EventTrackSaveSchema });
    expect(result.value).toEqual({
      name: 'Track 1',
      description: 'Track description',
    });
  });

  it('returns validation errors', async () => {
    const form = new FormData();
    form.append('name', '');
    form.append('description', '');

    const result = parse(form, { schema: EventTrackSaveSchema });
    expect(result.error).toEqual({
      name: 'Required',
    });
  });
});
