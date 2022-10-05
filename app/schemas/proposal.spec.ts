import { withZod } from '@remix-validated-form/with-zod';
import { ProposalCreateSchema, ProposalSubmissionSchema, ProposalUpdateSchema } from './proposal';

describe('Validate ProposalCreateSchema', () => {
  it('validates proposal form data', async () => {
    const formData = new FormData();
    formData.append('title', 'Hello world');
    formData.append('abstract', 'Welcome to the world!');
    formData.append('references', 'This is my world.');
    formData.append('languages[0]', 'en');
    formData.append('languages[1]', 'fr');
    formData.append('level', 'ADVANCED');

    const result = await withZod(ProposalCreateSchema).validate(formData);
    expect(result.data).toEqual({
      title: 'Hello world',
      abstract: 'Welcome to the world!',
      references: 'This is my world.',
      languages: ['en', 'fr'],
      level: 'ADVANCED',
    });
  });

  it('validates mandatory and format proposal form data', async () => {
    const formData = new FormData();
    formData.append('title', '');
    formData.append('abstract', '');
    formData.append('level', 'BAD_VALUE');

    const result = await withZod(ProposalCreateSchema).validate(formData);
    expect(result.error?.fieldErrors).toEqual({
      title: 'Required',
      abstract: 'Required',
      level: "Invalid enum value. Expected 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED', received 'BAD_VALUE'",
    });
  });
});

describe('Validate ProposalUpdateSchema', () => {
  it('validates fields', async () => {
    const formData = new FormData();
    formData.append('title', 'Title changed');
    formData.append('abstract', 'Abstract changes');
    formData.append('references', 'References changes');
    formData.append('level', 'INTERMEDIATE');
    formData.append('languages[0]', 'en');
    formData.append('formats', 'F1');
    formData.append('formats', 'F2');
    formData.append('categories', 'C1');
    formData.append('categories', 'C2');

    const result = await withZod(ProposalUpdateSchema).validate(formData);

    expect(result.data).toEqual({
      title: 'Title changed',
      abstract: 'Abstract changes',
      references: 'References changes',
      level: 'INTERMEDIATE',
      languages: ['en'],
      formats: ['F1', 'F2'],
      categories: ['C1', 'C2'],
    });
  });

  it('validates mandatory fields', async () => {
    const formData = new FormData();
    formData.append('title', '');
    formData.append('abstract', '');

    const result = await withZod(ProposalUpdateSchema).validate(formData);

    expect(result?.error?.fieldErrors).toEqual({ abstract: 'Required', title: 'Required' });
  });
});

describe('Validate ProposalSubmissionSchema', () => {
  it('validates proposal form data', async () => {
    const formData = new FormData();
    formData.append('message', 'Hello world');

    const result = await withZod(ProposalSubmissionSchema).validate(formData);
    expect(result.data).toEqual({ message: 'Hello world' });
  });
});

it.todo('Validate ProposalsFiltersSchema');

it.todo('Validate ProposalRatingDataSchema');
