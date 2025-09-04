import { z } from 'zod';
import { ProfileSchema, SpeakerCreationSchema } from './speaker.types.ts';

describe('Speaker schemas', () => {
  describe('ProfileSchema', () => {
    it('validates user details', async () => {
      const result = ProfileSchema.safeParse({
        name: 'John Doe',
        picture: 'https://example.com/photo.jpg',
        bio: 'lorem ipsum',
        references: 'impedit quidem quisquam',
        company: 'company',
        location: 'location',
        socialLinks: ['https://github.com/profile'],
      });

      expect(result.success && result.data).toEqual({
        name: 'John Doe',
        picture: 'https://example.com/photo.jpg',
        bio: 'lorem ipsum',
        references: 'impedit quidem quisquam',
        company: 'company',
        location: 'location',
        socialLinks: ['https://github.com/profile'],
      });
    });

    it('validates mandatory and format', async () => {
      const result = ProfileSchema.safeParse({
        name: '',
        picture: 'https://example.com/photo.jpg',
        bio: 'lorem ipsum',
        references: 'impedit quidem quisquam',
        company: 'company',
        location: 'location',
        socialLinks: ['https://github.com/profile'],
      });

      expect(result.success).toEqual(false);
      if (!result.success) {
        const { fieldErrors } = z.flattenError(result.error);
        expect(fieldErrors.name).toEqual(['Too small: expected string to have >=1 characters']);
      }
    });
  });

  describe('SpeakerCreationSchema', () => {
    it('validates speaker creation with mandatory email', async () => {
      const result = SpeakerCreationSchema.safeParse({
        name: 'John Doe',
        email: 'john.doe@example.com',
        picture: 'https://example.com/photo.jpg',
        bio: 'lorem ipsum',
        references: 'impedit quidem quisquam',
        company: 'company',
        location: 'location',
        socialLinks: ['https://github.com/profile'],
      });

      expect(result.success && result.data).toEqual({
        name: 'John Doe',
        email: 'john.doe@example.com',
        picture: 'https://example.com/photo.jpg',
        bio: 'lorem ipsum',
        references: 'impedit quidem quisquam',
        company: 'company',
        location: 'location',
        socialLinks: ['https://github.com/profile'],
      });
    });

    it('requires valid email format', async () => {
      const result = SpeakerCreationSchema.safeParse({
        name: 'John Doe',
        email: 'invalid-email',
        picture: 'https://example.com/photo.jpg',
        bio: 'lorem ipsum',
        company: 'company',
        location: 'location',
        socialLinks: ['https://github.com/profile'],
      });

      expect(result.success).toEqual(false);
      if (!result.success) {
        const { fieldErrors } = z.flattenError(result.error);
        expect(fieldErrors.email).toEqual(['Invalid email address']);
      }
    });
  });
});
