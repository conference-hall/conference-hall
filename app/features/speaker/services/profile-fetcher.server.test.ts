import { userFactory } from '@conference-hall/database/tests/factories/users.ts';
import { ProfileFetcher, ProfileNotFoundError } from './profile-fetcher.server.ts';

describe('ProfileFetcher', () => {
  describe('#get', () => {
    it('returns the speaker profile', async () => {
      const user = await userFactory();
      const profile = await ProfileFetcher.for(user.id).get();
      expect(profile).toEqual({
        name: user.name,
        email: user.email,
        picture: user.picture,
        bio: user.bio,
        references: user.references,
        company: user.company,
        location: user.location,
        socialLinks: user.socialLinks,
      });
    });

    it('throws an error when profile not found', async () => {
      await expect(ProfileFetcher.for('XXX').get()).rejects.toThrowError(ProfileNotFoundError);
    });
  });
});
