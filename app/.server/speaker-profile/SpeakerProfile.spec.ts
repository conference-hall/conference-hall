import type { User } from '@prisma/client';
import { userFactory } from 'tests/factories/users.ts';

import { ProfileNotFoundError, SpeakerProfile } from './SpeakerProfile.ts';
import { AdditionalInfoSchema, DetailsSchema, PersonalInfoSchema } from './SpeakerProfile.types.ts';

describe('SpeakerProfile', () => {
  let user: User;

  beforeEach(async () => {
    user = await userFactory();
  });

  describe('#get', () => {
    it('returns the speaker profile', async () => {
      const profile = await SpeakerProfile.for(user.id).get();
      expect(profile).toEqual({
        name: user.name,
        email: user.email,
        picture: user.picture,
        bio: user.bio,
        references: user.references,
        company: user.company,
        address: user.address,
        socials: user.socials,
      });
    });

    it('throws an error when profile not found', async () => {
      await expect(SpeakerProfile.for('XXX').get()).rejects.toThrowError(ProfileNotFoundError);
    });
  });

  describe('#save', () => {
    it('updates personal information', async () => {
      const profile = SpeakerProfile.for(user.id);

      await profile.save({
        name: 'John Doe',
        email: 'john.doe@email.com',
        picture: 'https://example.com/photo.jpg',
        bio: 'lorem ipsum',
        references: 'impedit quidem quisquam',
        company: 'company',
        address: 'address',
        socials: {
          twitter: 'twitter',
          github: 'github',
        },
      });

      const updated = await profile.get();
      expect(updated?.name).toEqual('John Doe');
      expect(updated?.email).toEqual('john.doe@email.com');
      expect(updated?.picture).toEqual('https://example.com/photo.jpg');
      expect(updated?.bio).toEqual('lorem ipsum');
      expect(updated?.references).toEqual('impedit quidem quisquam');
      expect(updated?.company).toEqual('company');
      expect(updated?.address).toEqual('address');
      expect(updated?.socials).toEqual({ github: 'github', twitter: 'twitter' });
    });
  });
});

describe('SpeakerProfile schemas', () => {
  describe('PersonalInfoSchema', () => {
    it('validates personal information', async () => {
      const result = PersonalInfoSchema.safeParse({
        name: 'John Doe',
        email: 'john.doe@email.com',
        picture: 'https://example.com/photo.jpg',
      });

      expect(result.success && result.data).toEqual({
        name: 'John Doe',
        email: 'john.doe@email.com',
        picture: 'https://example.com/photo.jpg',
      });
    });

    it('validates mandatory and format for personal information', async () => {
      const result = PersonalInfoSchema.safeParse({ name: '', email: '' });

      expect(result.success).toEqual(false);
      if (!result.success) {
        const { fieldErrors } = result.error.flatten();
        expect(fieldErrors.name).toEqual(['String must contain at least 1 character(s)']);
        expect(fieldErrors.email).toEqual(['Invalid email', 'String must contain at least 1 character(s)']);
      }
    });
  });

  describe('DetailsSchema', () => {
    it('validates user details', async () => {
      const result = DetailsSchema.safeParse({
        bio: 'lorem ipsum',
        references: 'impedit quidem quisquam',
      });

      expect(result.success && result.data).toEqual({
        bio: 'lorem ipsum',
        references: 'impedit quidem quisquam',
      });
    });
  });

  describe('AdditionalInfoSchema', () => {
    it('validates additional indormation', async () => {
      const result = AdditionalInfoSchema.safeParse({
        company: 'company',
        address: 'address',
        twitter: 'twitter',
        github: 'github',
      });

      expect(result.success && result.data).toEqual({
        company: 'company',
        address: 'address',
        socials: { github: 'github', twitter: 'twitter' },
      });
    });
  });
});
