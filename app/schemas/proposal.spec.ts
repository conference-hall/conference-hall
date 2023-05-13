import {
  ProposalCreateSchema,
  ProposalsStatusUpdateSchema,
  ProposalReviewDataSchema,
  ProposalsFiltersSchema,
  ProposalSubmissionSchema,
  ProposalUpdateSchema,
} from './proposal';
import { parse } from '@conform-to/zod';

describe('Validate ProposalCreateSchema', () => {
  it('validates proposal form data', async () => {
    const form = new FormData();
    form.append('title', 'Hello world');
    form.append('abstract', 'Welcome to the world!');
    form.append('references', 'This is my world.');
    form.append('languages[0]', 'en');
    form.append('languages[1]', 'fr');
    form.append('level', 'ADVANCED');

    const result = parse(form, { schema: ProposalCreateSchema });
    expect(result.value).toEqual({
      title: 'Hello world',
      abstract: 'Welcome to the world!',
      references: 'This is my world.',
      languages: ['en', 'fr'],
      level: 'ADVANCED',
    });
  });

  it('validates mandatory and format proposal form data', async () => {
    const form = new FormData();
    form.append('title', '');
    form.append('abstract', '');
    form.append('level', 'BAD_VALUE');

    const result = parse(form, { schema: ProposalCreateSchema });
    expect(result.error).toEqual({
      title: 'Required',
      abstract: 'Required',
      level: "Invalid enum value. Expected 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED', received 'BAD_VALUE'",
    });
  });

  it('reset proposal form data', async () => {
    const form = new FormData();
    form.append('title', 'Hello world');
    form.append('abstract', 'Welcome to the world!');
    form.append('references', '');
    form.append('level', '');

    const result = parse(form, { schema: ProposalCreateSchema });
    expect(result.value).toEqual({
      title: 'Hello world',
      abstract: 'Welcome to the world!',
      references: null,
      languages: [],
      level: null,
    });
  });
});

describe('Validate ProposalUpdateSchema', () => {
  it('validates fields', async () => {
    const form = new FormData();
    form.append('title', 'Title changed');
    form.append('abstract', 'Abstract changes');
    form.append('references', 'References changes');
    form.append('level', 'INTERMEDIATE');
    form.append('languages[0]', 'en');
    form.append('formats', 'F1');
    form.append('formats', 'F2');
    form.append('categories', 'C1');
    form.append('categories', 'C2');

    const result = parse(form, { schema: ProposalUpdateSchema });
    expect(result.value).toEqual({
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
    const form = new FormData();
    form.append('title', '');
    form.append('abstract', '');

    const result = parse(form, { schema: ProposalUpdateSchema });
    expect(result?.error).toEqual({ abstract: 'Required', title: 'Required' });
  });

  it('reset fields', async () => {
    const form = new FormData();
    form.append('title', 'Title changed');
    form.append('abstract', 'Abstract changes');
    form.append('references', '');
    form.append('level', '');

    const result = parse(form, { schema: ProposalUpdateSchema });
    expect(result.value).toEqual({
      title: 'Title changed',
      abstract: 'Abstract changes',
      references: null,
      level: null,
      languages: [],
    });
  });
});

describe('Validate ProposalSubmissionSchema', () => {
  it('validates submission message', async () => {
    const form = new FormData();
    form.append('message', 'Hello world');

    const result = parse(form, { schema: ProposalSubmissionSchema });
    expect(result.value).toEqual({ message: 'Hello world' });
  });

  it('reset submission message', async () => {
    const form = new FormData();
    form.append('message', '');

    const result = parse(form, { schema: ProposalSubmissionSchema });
    expect(result.value).toEqual({ message: null });
  });
});

describe('Validate ProposalsFiltersSchema', () => {
  it('returns valid filters', async () => {
    const params = new URLSearchParams({
      query: 'foo',
      sort: 'newest',
      status: 'ACCEPTED',
      formats: 'Format 1',
      categories: 'Category 1',
    });

    const result = ProposalsFiltersSchema.safeParse(Object.fromEntries(params));
    expect(result.success && result.data).toEqual({
      query: 'foo',
      sort: 'newest',
      status: ['ACCEPTED'],
      formats: 'Format 1',
      categories: 'Category 1',
    });
  });

  it('returns errors on invalid filters', async () => {
    const params = new URLSearchParams({
      sort: 'toto',
      status: 'toto',
    });

    const result = ProposalsFiltersSchema.safeParse(Object.fromEntries(params));
    expect(!result.success && result.error.flatten().fieldErrors).toEqual({
      sort: ["Invalid enum value. Expected 'newest' | 'oldest', received 'toto'"],
      status: [
        "Invalid enum value. Expected 'SUBMITTED' | 'ACCEPTED' | 'REJECTED' | 'CONFIRMED' | 'DECLINED', received 'toto'",
      ],
    });
  });
});

describe('Validate ProposalReviewDataSchema', () => {
  it('validates submission message', async () => {
    const form = new FormData();
    form.append('note', '1');
    form.append('feeling', 'NEUTRAL');

    const result = parse(form, { schema: ProposalReviewDataSchema });
    expect(result.value).toEqual({ feeling: 'NEUTRAL', note: 1, comment: null });
  });

  it('returns errors on invalid data', async () => {
    const form = new FormData();
    form.append('note', 'toto');
    form.append('feeling', 'toto');

    const result = parse(form, { schema: ProposalReviewDataSchema });
    expect(result.error).toEqual({
      feeling: "Invalid enum value. Expected 'NEUTRAL' | 'POSITIVE' | 'NEGATIVE' | 'NO_OPINION', received 'toto'",
      note: 'Expected number, received string',
    });
  });
});

describe('Validate ProposalsStatusUpdateSchema', () => {
  it('validates status update schema', async () => {
    const form = new FormData();
    form.append('status', 'ACCEPTED');
    form.append('selection', '1');
    form.append('selection', '2');

    const result = parse(form, { schema: ProposalsStatusUpdateSchema });
    expect(result.value).toEqual({
      status: 'ACCEPTED',
      selection: ['1', '2'],
    });
  });

  it('returns errors on invalid data', async () => {
    const form = new FormData();
    form.append('status', 'foo');

    const result = parse(form, { schema: ProposalsStatusUpdateSchema });
    expect(result.error).toEqual({
      status:
        "Invalid enum value. Expected 'SUBMITTED' | 'ACCEPTED' | 'REJECTED' | 'CONFIRMED' | 'DECLINED', received 'foo'",
    });
  });
});
