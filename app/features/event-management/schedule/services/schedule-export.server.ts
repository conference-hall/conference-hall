import type { EventType } from '@prisma/client';
import { db } from 'prisma/db.server.ts';
import { getDatesRange } from '~/shared/datetimes/datetimes.ts';
import { utcToTimezone } from '~/shared/datetimes/timezone.ts';
import { ForbiddenOperationError } from '~/shared/errors.server.ts';
import { UserEventAuthorization } from '~/shared/user/user-event-authorization.server.ts';

export class EventScheduleExport extends UserEventAuthorization {
  static for(userId: string, team: string, event: string) {
    return new EventScheduleExport(userId, team, event);
  }

  async forJsonExport() {
    const event = await this.needsPermission('canEditEventSchedule');

    return EventScheduleExport.toJson(event.id, event.type);
  }

  static async toJson(eventId: string, eventType: EventType) {
    if (eventType === 'MEETUP') throw new ForbiddenOperationError();

    const schedule = await db.schedule.findFirst({ where: { eventId }, include: { sessions: true } });
    if (!schedule) return null;

    const sessions = await db.scheduleSession.findMany({
      where: { scheduleId: schedule.id },
      include: { proposal: { include: { speakers: true, formats: true, categories: true } }, track: true },
    });

    const days = getDatesRange(schedule.start, schedule.end);

    return {
      name: schedule.name,
      days: days.map((day) => utcToTimezone(day, schedule.timezone).toISOString()),
      timeZone: schedule.timezone,
      sessions: sessions.map(({ proposal, track, ...session }) => ({
        id: session.id,
        start: utcToTimezone(session.start, schedule.timezone).toISOString(),
        end: utcToTimezone(session.end, schedule.timezone).toISOString(),
        track: track.name,
        title: proposal ? proposal.title : session.name,
        language: session.language || null,
        proposal: proposal
          ? {
              id: proposal.id,
              abstract: proposal.abstract,
              level: proposal.level || null,
              formats: proposal.formats.map(({ name }) => name),
              categories: proposal.categories.map(({ name }) => name),
              speakers: proposal.speakers.map((speaker) => ({
                id: speaker.id,
                name: speaker.name,
                bio: speaker.bio || null,
                company: speaker.company || null,
                picture: speaker.picture || null,
                socialLinks: speaker.socialLinks,
              })),
            }
          : null,
      })),
    };
  }
}
