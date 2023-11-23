import { db } from '~/libs/db';

export type SpeakerSocialLinks = {
  github?: string | null;
  twitter?: string | null;
};

export class SpeakerProfile {
  constructor(private userId: string) {}

  static for(userId: string) {
    return new SpeakerProfile(userId);
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
      address: user.address,
      socials: user.socials as SpeakerSocialLinks,
    };
  }
}

export class ProfileNotFoundError extends Error {}
