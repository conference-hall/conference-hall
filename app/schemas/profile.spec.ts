import { withZod } from '@remix-validated-form/with-zod';
import { AdditionalInfoSchema, DetailsSchema, PersonalInfoSchema } from './profile';

describe('Validate PersonalInfoSchema', () => {
  it('validates personal information', async () => {
    const formData = new FormData();
    formData.append('name', 'John Doe');
    formData.append('email', 'john.doe@email.com');
    formData.append('photoURL', 'https://example.com/photo.jpg');

    const result = await withZod(PersonalInfoSchema).validate(formData);
    expect(result.data).toEqual({
      name: 'John Doe',
      email: 'john.doe@email.com',
      photoURL: 'https://example.com/photo.jpg',
    });
  });

  it('validates mandatory and format for personal information', async () => {
    const formData = new FormData();
    formData.append('name', '');
    formData.append('email', '');
    formData.append('photoURL', '');

    const result = await withZod(PersonalInfoSchema).validate(formData);
    expect(result?.error?.fieldErrors).toEqual({
      name: 'String must contain at least 1 character(s)',
      email: 'Invalid email',
      photoURL: 'Invalid url',
    });
  });
});

describe('Validate DetailsSchema', () => {
  it('validates user details', async () => {
    const formData = new FormData();
    formData.append('bio', 'lorem ipsum');
    formData.append('references', 'impedit quidem quisquam');

    const result = await withZod(DetailsSchema).validate(formData);
    expect(result.data).toEqual({
      bio: 'lorem ipsum',
      references: 'impedit quidem quisquam',
    });
  });
});

describe('Validate AdditionalInfoSchema', () => {
  it('validates additional indormation', async () => {
    const formData = new FormData();
    formData.append('company', 'company');
    formData.append('address', 'address');
    formData.append('twitter', 'twitter');
    formData.append('github', 'github');

    const result = await withZod(AdditionalInfoSchema).validate(formData);
    expect(result.data).toEqual({
      company: 'company',
      address: 'address',
      twitter: 'twitter',
      github: 'github',
    });
  });
});
