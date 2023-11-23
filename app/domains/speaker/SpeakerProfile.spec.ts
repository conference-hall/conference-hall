import type { User } from '@prisma/client';
import { userFactory } from 'tests/factories/users';

import { ProfileNotFoundError, SpeakerProfile } from './SpeakerProfile';

describe('SpeakerProfile', () => {
  let user: User;
  beforeEach(async () => {
    user = await userFactory();
  });

  describe('get', () => {
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
});
