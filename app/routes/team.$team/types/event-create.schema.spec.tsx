import { parse } from '@conform-to/zod';

import { EventCreateSchema } from './event-create.schema';

describe('Validate EventCreateSchema', () => {
  it('validates valid inputs', async () => {
    const form = new FormData();
    form.append('type', 'CONFERENCE');
    form.append('name', 'Event name');
    form.append('visibility', 'PUBLIC');
    form.append('slug', 'event-name');

    const result = parse(form, { schema: EventCreateSchema });
    expect(result.value).toEqual({
      name: 'Event name',
      slug: 'event-name',
      type: 'CONFERENCE',
      visibility: 'PUBLIC',
    });
  });

  it('returns validation errors', async () => {
    const form = new FormData();
    form.append('type', 'toto');
    form.append('name', '');
    form.append('visibility', 'toto');
    form.append('slug', '!@#');

    const result = parse(form, { schema: EventCreateSchema });
    expect(result.error).toEqual({
      name: 'Required',
      slug: 'Must only contain lower case alphanumeric and dashes (-).',
      type: "Invalid enum value. Expected 'CONFERENCE' | 'MEETUP', received 'toto'",
      visibility: "Invalid enum value. Expected 'PUBLIC' | 'PRIVATE', received 'toto'",
    });
  });
});
