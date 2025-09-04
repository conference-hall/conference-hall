import { db } from 'prisma/db.server.ts';
import type { ProfileData, SocialLinks } from '~/shared/types/speaker.types.ts';

export class SpeakerProfile {
  constructor(private userId: string) {}

  static for(userId: string) {
    return new SpeakerProfile(userId);
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
