import type { AuthorizedApiEvent, AuthorizedEvent } from '~/shared/authorization/types.ts';
import { getDatesRange } from '~/shared/datetimes/datetimes.ts';
import { utcToTimezone } from '~/shared/datetimes/timezone.ts';
import { ForbiddenOperationError } from '~/shared/errors.server.ts';
import { db } from '../../../../../prisma/db.server.ts';
import { type Event, TalkLevel } from '../../../../../prisma/generated/client.ts';

export class EventScheduleExport {
  private constructor(private event: Event) {}

  static forUser(authorizedEvent: AuthorizedEvent) {
    const { event, permissions } = authorizedEvent;
    if (!permissions.canEditEventSchedule) throw new ForbiddenOperationError();
    if (event.type === 'MEETUP') throw new ForbiddenOperationError();
    return new EventScheduleExport(event);
  }

  static forApi(authorizedApiEvent: AuthorizedApiEvent) {
    const { event } = authorizedApiEvent;
    if (event.type === 'MEETUP') throw new ForbiddenOperationError();
    return new EventScheduleExport(event);
  }

  async toJson() {
    const schedule = await db.schedule.findFirst({ where: { eventId: this.event.id }, include: { sessions: true } });
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
              proposalNumber: proposal.proposalNumber,
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

  // Representative example used to document the API response when an event has no schedule yet.
  static sampleJson(): EventScheduleExportJson {
    return {
      name: 'Main schedule',
      days: ['2026-06-01T00:00:00.000+02:00'],
      timeZone: 'Europe/Paris',
      sessions: [
        {
          id: 'ses_1a2b3c',
          start: '2026-06-01T09:00:00.000+02:00',
          end: '2026-06-01T10:00:00.000+02:00',
          track: 'Main Track',
          title: 'Building resilient APIs with TypeScript',
          language: 'en',
          proposal: {
            id: 'prop_1a2b3c',
            proposalNumber: 42,
            abstract: 'A deep dive into designing robust, type-safe HTTP APIs that scale.',
            level: TalkLevel.INTERMEDIATE,
            formats: ['Conference talk'],
            categories: ['Backend'],
            speakers: [
              {
                id: 'spk_9z8y7x',
                name: 'Jane Doe',
                bio: 'Senior software engineer focused on developer experience.',
                company: 'Acme Corp',
                picture: 'https://example.com/speakers/jane-doe.jpg',
                socialLinks: ['https://twitter.com/jane_doe'],
              },
            ],
          },
        },
      ],
    };
  }
}

export type EventScheduleExportJson = NonNullable<Awaited<ReturnType<EventScheduleExport['toJson']>>>;
