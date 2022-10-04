import { withZod } from '@remix-validated-form/with-zod';
import { TalkSaveSchema } from './talks';

describe('Validate TalkSaveSchema', () => {
  it('validates talk form data', async () => {
    const formData = new FormData();
    formData.append('title', 'Hello world');
    formData.append('abstract', 'Welcome to the world!');
    formData.append('references', 'This is my world.');
    formData.append('languages[0]', 'en');
    formData.append('languages[1]', 'fr');
    formData.append('level', 'ADVANCED');

    const result = await withZod(TalkSaveSchema).validate(formData);
    expect(result.data).toEqual({
      title: 'Hello world',
      abstract: 'Welcome to the world!',
      references: 'This is my world.',
      languages: ['en', 'fr'],
      level: 'ADVANCED',
    });
  });

  it('validates mandatory and format talk form data', async () => {
    const formData = new FormData();
    formData.append('title', '');
    formData.append('abstract', '');
    formData.append('level', 'BAD_VALUE');

    const result = await withZod(TalkSaveSchema).validate(formData);
    expect(result.error?.fieldErrors).toEqual({
      title: 'Required',
      abstract: 'Required',
      level: "Invalid enum value. Expected 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED', received 'BAD_VALUE'",
    });
  });
});
