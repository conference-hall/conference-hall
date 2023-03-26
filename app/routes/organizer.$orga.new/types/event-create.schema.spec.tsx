import { withZod } from '@remix-validated-form/with-zod';
import { EventCreateSchema } from './event-create.schema';

describe('Validate EventCreateSchema', () => {
  it('validates valid inputs', async () => {
    const formData = new FormData();
    formData.append('type', 'CONFERENCE');
    formData.append('name', 'Event name');
    formData.append('visibility', 'PUBLIC');
    formData.append('slug', 'event-name');

    const result = await withZod(EventCreateSchema).validate(formData);
    expect(result.data).toEqual({
      name: 'Event name',
      slug: 'event-name',
      type: 'CONFERENCE',
      visibility: 'PUBLIC',
    });
  });

  it('returns validation errors', async () => {
    const formData = new FormData();
    formData.append('type', 'toto');
    formData.append('name', '');
    formData.append('visibility', 'toto');
    formData.append('slug', '!@#');

    const result = await withZod(EventCreateSchema).validate(formData);
    expect(result.error?.fieldErrors).toEqual({
      name: 'Required',
      slug: 'Must only contain lower case alphanumeric and dashes (-).',
      type: "Invalid enum value. Expected 'CONFERENCE' | 'MEETUP', received 'toto'",
      visibility: "Invalid enum value. Expected 'PUBLIC' | 'PRIVATE', received 'toto'",
    });
  });
});
