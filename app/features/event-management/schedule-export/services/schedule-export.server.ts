import { Readable } from 'node:stream';
import type { AuthorizedApiEvent, AuthorizedEvent } from '~/shared/authorization/types.ts';
import { getDatesRange } from '~/shared/datetimes/datetimes.ts';
import { utcToTimezone } from '~/shared/datetimes/timezone.ts';
import { ForbiddenOperationError } from '~/shared/errors.server.ts';
import type { Event, ScheduleSession } from '../../../../../prisma/generated/client.ts';
import { db } from '../../../../../prisma/db.server.ts';

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

  private createSessionStream(scheduleId: string, batchSize = 100): Readable {
    let cursor: string | undefined;

    return new Readable({
      objectMode: true,
      highWaterMark: batchSize,
      async read() {
        try {
          const batch = await db.scheduleSession.findMany({
            where: { scheduleId },
            include: {
              proposal: { include: { speakers: true, formats: true, categories: true } },
              track: true,
            },
            orderBy: { id: 'asc' },
            take: batchSize,
            ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
          });

          for (const session of batch) {
            this.push(session);
          }

          if (batch.length < batchSize) {
            this.push(null);
          } else {
            cursor = batch[batch.length - 1].id;
          }
        } catch (err) {
          this.destroy(err instanceof Error ? err : new Error(String(err)));
        }
      },
    });
  }

  private transformSession(
    session: ScheduleSession & {
      proposal: {
        id: string;
        title: string;
        proposalNumber: number | null;
        abstract: string;
        level: string | null;
        speakers: Array<{
          id: string;
          name: string;
          bio: string | null;
          company: string | null;
          picture: string | null;
          socialLinks: any;
        }>;
        formats: Array<{ name: string }>;
        categories: Array<{ name: string }>;
      } | null;
      track: { name: string };
    },
    timezone: string,
  ) {
    const { proposal, track, ...sessionData } = session;
    return {
      id: sessionData.id,
      start: utcToTimezone(sessionData.start, timezone).toISOString(),
      end: utcToTimezone(sessionData.end, timezone).toISOString(),
      track: track.name,
      title: proposal ? proposal.title : sessionData.name,
      language: sessionData.language || null,
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
    };
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
      sessions: sessions.map((session) => this.transformSession(session, schedule.timezone)),
    };
  }

  async toJsonStream(): Promise<ReadableStream | null> {
    const schedule = await db.schedule.findFirst({
      where: { eventId: this.event.id },
    });
    if (!schedule) return null;

    const sessionStream = this.createSessionStream(schedule.id, 100);
    const encoder = new TextEncoder();
    const transformSession = this.transformSession.bind(this);

    return new ReadableStream({
      async start(controller) {
        try {
          // 1. Stream opening: {"name":"...","days":[...],"timeZone":"...","sessions":[
          const days = getDatesRange(schedule.start, schedule.end);
          const opening = {
            name: schedule.name,
            days: days.map((day) => utcToTimezone(day, schedule.timezone).toISOString()),
            timeZone: schedule.timezone,
          };
          controller.enqueue(encoder.encode(`${JSON.stringify(opening).slice(0, -1)},"sessions":[`));

          // 2. Stream sessions using async iteration over Node.js Readable
          let isFirst = true;
          for await (const session of sessionStream) {
            const sessionJson = transformSession(session, schedule.timezone);
            const prefix = isFirst ? '' : ',';
            controller.enqueue(encoder.encode(prefix + JSON.stringify(sessionJson)));
            isFirst = false;
          }

          // 3. Stream closing: ]}
          controller.enqueue(encoder.encode(']}'));
          controller.close();
        } catch (error) {
          controller.error(error);
          sessionStream.destroy();
        }
      },
      cancel() {
        sessionStream.destroy();
      },
    });
  }
}
