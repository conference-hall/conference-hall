import { type EventCategory, type EventFormat, Prisma } from '@prisma/client';
import { db } from 'prisma/db.server.ts';

import { UserEvent } from '../event-settings/user-event.ts';

// TODO: Add tests
export class EventMetrics {
  constructor(
    private userId: string,
    private userEvent: UserEvent,
  ) {}

  static for(userId: string, teamSlug: string, eventSlug: string) {
    const userEvent = UserEvent.for(userId, teamSlug, eventSlug);
    return new EventMetrics(userId, userEvent);
  }

  async metrics() {
    const { id, formats, categories } = await this.userEvent.get();

    const proposalsCount = await db.proposal.count({ where: { eventId: id, isDraft: false } });

    const reviewsCount = await db.review.count({
      where: { proposal: { eventId: id, isDraft: false }, userId: this.userId },
    });

    const speakersCount = await db.user.count({
      where: { proposals: { some: { eventId: id, isDraft: false } } },
    });

    const byFormats = await this.proposalsByFormats(id, formats);

    const byCategories = await this.proposalsByCategories(id, categories);

    return { proposalsCount, speakersCount, reviewsCount, byFormats, byCategories };
  }

  async proposalsByFormats(eventId: string, formats: Array<Pick<EventFormat, 'id' | 'name' | 'description'>>) {
    if (formats.length === 0) return null;

    const byFormats = await db.$queryRaw<Array<{ id: string; value: BigInt }>>(
      Prisma.sql`
        SELECT _proposals_formats."A" AS id, count(proposals.id) AS value 
        FROM _proposals_formats
        JOIN proposals ON proposals.id = _proposals_formats."B"
        WHERE proposals."isDraft" IS FALSE 
        AND proposals."eventId" = ${eventId}
        GROUP BY _proposals_formats."A"
      `,
    );

    return byFormats.map((item) => {
      const format = formats.find((f) => f.id === item.id);
      return {
        id: item.id,
        name: format?.name || 'unknown',
        value: Number(item.value),
        to: `reviews?formats=${item.id}`,
      };
    });
  }

  async proposalsByCategories(eventId: string, categories: Array<Pick<EventCategory, 'id' | 'name' | 'description'>>) {
    if (categories.length === 0) return null;

    const byCategories = await db.$queryRaw<Array<{ id: string; value: BigInt }>>(
      Prisma.sql`
        SELECT _proposals_categories."A" AS id, count(proposals.id) AS value 
        FROM _proposals_categories
        JOIN proposals ON proposals.id = _proposals_categories."B"
        WHERE proposals."isDraft" IS FALSE 
        AND proposals."eventId" = ${eventId}
        GROUP BY _proposals_categories."A"
      `,
    );

    return byCategories.map((item) => {
      const category = categories.find((f) => f.id === item.id);
      return {
        id: item.id,
        name: category?.name || 'unknown',
        value: Number(item.value),
        to: `reviews?categories=${item.id}`,
      };
    });
  }
}
