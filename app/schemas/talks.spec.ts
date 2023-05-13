import { TalkSaveSchema } from './talks';
import { parse } from '@conform-to/zod';

describe('Validate TalkSaveSchema', () => {
  it('validates talk form data', async () => {
    const form = new FormData();
    form.append('title', 'Hello world');
    form.append('abstract', 'Welcome to the world!');
    form.append('references', 'This is my world.');
    form.append('languages[0]', 'en');
    form.append('languages[1]', 'fr');
    form.append('level', 'ADVANCED');

    const result = parse(form, { schema: TalkSaveSchema });
    expect(result.value).toEqual({
      title: 'Hello world',
      abstract: 'Welcome to the world!',
      references: 'This is my world.',
      languages: ['en', 'fr'],
      level: 'ADVANCED',
    });
  });

  it('validates mandatory and format talk form data', async () => {
    const form = new FormData();
    form.append('title', '');
    form.append('abstract', '');
    form.append('level', 'BAD_VALUE');

    const result = parse(form, { schema: TalkSaveSchema });
    expect(result.error).toEqual({
      title: 'Required',
      abstract: 'Required',
      level: "Invalid enum value. Expected 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED', received 'BAD_VALUE'",
    });
  });

  it('reset talk form data', async () => {
    const form = new FormData();
    form.append('title', 'Hello world');
    form.append('abstract', 'Welcome to the world!');
    form.append('references', '');
    form.append('level', '');

    const result = parse(form, { schema: TalkSaveSchema });
    expect(result.value).toEqual({
      title: 'Hello world',
      abstract: 'Welcome to the world!',
      references: null,
      level: null,
      languages: [],
    });
  });
});
