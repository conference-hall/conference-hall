import { parse } from '@conform-to/zod';

import { AdditionalInfoSchema, DetailsSchema, PersonalInfoSchema } from './profile.schema.tsx';

describe('Validate PersonalInfoSchema', () => {
  it('validates personal information', async () => {
    const form = new FormData();
    form.append('name', 'John Doe');
    form.append('email', 'john.doe@email.com');
    form.append('picture', 'https://example.com/photo.jpg');

    const result = parse(form, { schema: PersonalInfoSchema });
    expect(result.value).toEqual({
      name: 'John Doe',
      email: 'john.doe@email.com',
      picture: 'https://example.com/photo.jpg',
    });
  });

  it('validates mandatory and format for personal information', async () => {
    const form = new FormData();
    form.append('name', '');
    form.append('email', '');
    form.append('picture', '');

    const result = parse(form, { schema: PersonalInfoSchema });
    expect(result?.error).toEqual({
      name: ['Required'],
      email: ['Required'],
    });
  });
});

describe('Validate DetailsSchema', () => {
  it('validates user details', async () => {
    const form = new FormData();
    form.append('bio', 'lorem ipsum');
    form.append('references', 'impedit quidem quisquam');

    const result = parse(form, { schema: DetailsSchema });
    expect(result.value).toEqual({
      bio: 'lorem ipsum',
      references: 'impedit quidem quisquam',
    });
  });

  it('reset user details', async () => {
    const form = new FormData();
    form.append('bio', '');
    form.append('references', '');

    const result = parse(form, { schema: DetailsSchema });
    expect(result.value).toEqual({ bio: null, references: null });
  });
});

describe('Validate AdditionalInfoSchema', () => {
  it('validates additional indormation', async () => {
    const form = new FormData();
    form.append('company', 'company');
    form.append('address', 'address');
    form.append('twitter', 'twitter');
    form.append('github', 'github');

    const result = parse(form, { schema: AdditionalInfoSchema });
    expect(result.value).toEqual({
      company: 'company',
      address: 'address',
      twitter: 'twitter',
      github: 'github',
    });
  });

  it('reset additional indormation', async () => {
    const form = new FormData();
    form.append('company', '');
    form.append('address', '');
    form.append('twitter', '');
    form.append('github', '');

    const result = parse(form, { schema: AdditionalInfoSchema });
    expect(result.value).toEqual({ company: null, address: null, twitter: null, github: null });
  });
});
