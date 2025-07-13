import { db } from 'prisma/db.server.ts';
import { z } from 'zod/v4';
import { UserTeamAuthorization } from '~/shared/user/user-team-authorization.server.ts';
import { SlugSchema } from '~/shared/validators/slug.ts';

export class EventCreation extends UserTeamAuthorization {
  static for(userId: string, team: string) {
    return new EventCreation(userId, team);
  }

  async create(data: z.infer<typeof EventCreateSchema>) {
    await this.needsPermission('canCreateEvent');

    return db.event.create({
      data: {
        ...data,
        creator: { connect: { id: this.userId } },
        team: { connect: { slug: this.team } },
      },
    });
  }

  static async isSlugValid(slug: string) {
    const count = await db.event.count({ where: { slug } });
    return count === 0;
  }
}

export const EventCreateSchema = z.object({
  name: z.string().trim().min(3).max(50),
  visibility: z.enum(['PUBLIC', 'PRIVATE']),
  type: z.enum(['CONFERENCE', 'MEETUP']),
  timezone: z.string(),
  slug: SlugSchema.refine(EventCreation.isSlugValid, { error: 'This URL already exists.' }),
});
