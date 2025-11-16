import { db } from '@conference-hall/database';
import type { SocialLinks } from '@conference-hall/shared/types/speaker.types.ts';

export class ProfileFetcher {
  constructor(private userId: string) {}

  static for(userId: string) {
    return new ProfileFetcher(userId);
  }

  async get() {
    const user = await db.user.findUnique({ where: { id: this.userId } });
    if (!user) throw new ProfileNotFoundError();

    return {
      name: user.name,
      email: user.email,
      picture: user.picture,
      bio: user.bio,
      references: user.references,
      company: user.company,
      location: user.location,
      socialLinks: user.socialLinks as SocialLinks,
    };
  }
}

export class ProfileNotFoundError extends Error {}
