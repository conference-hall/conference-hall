import { db } from 'prisma/db.server.ts';
import type { SocialLinks } from '~/shared/types/speaker.types.ts';
import type { ProfileData } from './speaker-profile.schema.server.ts';

export class SpeakerProfile {
  constructor(private userId: string) {}

  static for(userId: string) {
    return new SpeakerProfile(userId);
  }

  // todo(folders): where to put this file?
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

  async save(data: ProfileData) {
    const user = await db.user.update({ where: { id: this.userId }, data });

    await db.eventSpeaker.updateMany({
      where: { userId: this.userId },
      data: {
        name: user.name,
        email: user.email,
        bio: user.bio,
        picture: user.picture,
        company: user.company,
        location: user.location,
        references: user.references,
        socialLinks: user.socialLinks as SocialLinks,
      },
    });

    return user;
  }
}

export class ProfileNotFoundError extends Error {}
