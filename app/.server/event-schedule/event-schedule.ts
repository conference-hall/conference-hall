import type { EventType, Prisma } from '@prisma/client';
import { db } from 'prisma/db.server.ts';

import {
  ApiKeyInvalidError,
  EventNotFoundError,
  ForbiddenError,
  ForbiddenOperationError,
  NotFoundError,
} from '~/libs/errors.server.ts';

import { toZonedTime } from 'date-fns-tz';
import { getDatesRange } from '~/libs/datetimes/datetimes.ts';
import type { Languages } from '~/types/proposals.types.ts';
import { UserEvent } from '../event-settings/user-event.ts';
import type {
  ScheduleCreateData,
  ScheduleSessionCreateData,
  ScheduleSessionUpdateData,
  ScheduleTracksSaveData,
} from './event-schedule.types.ts';

export class EventSchedule {
  constructor(
    private eventSlug: string,
    private userEvent: UserEvent,
  ) {}

  static for(userId: string, teamSlug: string, eventSlug: string) {
    const userEvent = UserEvent.for(userId, teamSlug, eventSlug);
    return new EventSchedule(eventSlug, userEvent);
  }

  async get() {
    const event = await this.userEvent.needsPermission('canEditEventSchedule');
    if (event.type === 'MEETUP') throw new ForbiddenOperationError();

    const schedule = await db.schedule.findFirst({ where: { eventId: event.id }, include: { tracks: true } });
    if (!schedule) return null;

    return {
      id: schedule.id,
      name: schedule.name,
      timezone: schedule.timezone,
      start: schedule.start,
      end: schedule.end,
      tracks: [...schedule.tracks]
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        .map((t) => ({ id: t.id, name: t.name })),
    };
  }

  async create(data: ScheduleCreateData) {
    const event = await this.userEvent.needsPermission('canEditEventSchedule');
    if (event.type === 'MEETUP') throw new ForbiddenOperationError();

    await db.schedule.create({
      data: {
        name: data.name,
        timezone: data.timezone,
        start: data.start,
        end: data.end,
        displayStartMinutes: 9 * 60,
        displayEndMinutes: 18 * 60,
        tracks: { create: { name: 'Main stage' } },
        event: { connect: { slug: this.eventSlug } },
      },
    });
  }

  async update(data: Partial<Prisma.ScheduleCreateInput>) {
    const event = await this.userEvent.needsPermission('canEditEventSchedule');
    if (event.type === 'MEETUP') throw new ForbiddenOperationError();

    const schedule = await db.schedule.findFirst({ where: { eventId: event.id } });
    if (!schedule) throw new NotFoundError('Schedule not found');

    await db.schedule.update({ data, where: { id: schedule.id } });
  }

  async delete() {
    const event = await this.userEvent.needsPermission('canEditEventSchedule');
    if (event.type === 'MEETUP') throw new ForbiddenOperationError();

    const schedule = await db.schedule.findFirst({ where: { eventId: event.id } });
    if (!schedule) throw new NotFoundError('Schedule not found');

    await db.schedule.delete({ where: { id: schedule.id } });
  }

  async addSession(data: ScheduleSessionCreateData) {
    const event = await this.userEvent.needsPermission('canEditEventSchedule');
    if (event.type === 'MEETUP') throw new ForbiddenOperationError();

    const schedule = await db.schedule.findFirst({ where: { eventId: event.id } });
    if (!schedule) throw new NotFoundError('Schedule not found');

    return db.scheduleSession.create({
      data: {
        trackId: data.trackId,
        start: data.start,
        end: data.end,
        color: 'gray',
        scheduleId: schedule.id,
      },
    });
  }

  async updateSession(data: ScheduleSessionUpdateData) {
    const event = await this.userEvent.needsPermission('canEditEventSchedule');
    if (event.type === 'MEETUP') throw new ForbiddenOperationError();

    const schedule = await db.schedule.findFirst({ where: { eventId: event.id } });
    if (!schedule) throw new NotFoundError('Schedule not found');

    let language = data.language ?? null;
    if (!language && data.proposalId) {
      const proposal = await db.proposal.findUnique({ where: { id: data.proposalId } });
      language = (proposal?.languages as Languages).at(0) ?? null;
    }

    return db.scheduleSession.update({
      data: {
        trackId: data.trackId,
        start: data.start,
        end: data.end,
        color: data.color,
        name: !data.proposalId ? (data.name ?? null) : null,
        proposalId: data.proposalId ? data.proposalId : null,
        emojis: data.emojis,
        language,
      },
      where: { id: data.id, scheduleId: schedule.id },
    });
  }

  async deleteSession(sessionId: string) {
    const event = await this.userEvent.needsPermission('canEditEventSchedule');
    if (event.type === 'MEETUP') throw new ForbiddenOperationError();

    const schedule = await db.schedule.findFirst({ where: { eventId: event.id } });
    if (!schedule) throw new NotFoundError('Schedule not found');

    if (!sessionId) return; // sessionId checked and deleteMany to avoid "Record to delete does not exist"
    await db.scheduleSession.deleteMany({ where: { id: sessionId, scheduleId: schedule.id } });
  }

  async saveTracks(tracks: ScheduleTracksSaveData['tracks']) {
    const event = await this.userEvent.needsPermission('canEditEventSchedule');
    if (event.type === 'MEETUP') throw new ForbiddenOperationError();

    const schedule = await db.schedule.findFirst({ where: { eventId: event.id }, include: { tracks: true } });
    if (!schedule) throw new NotFoundError('Schedule not found');

    const deletedTracks = schedule.tracks.filter((t) => !tracks.find((ut) => ut.id === t.id));

    if (schedule.tracks.length - deletedTracks.length <= 0) {
      throw new ForbiddenError('You must have at least one track defined');
    } else if (deletedTracks.length > 0) {
      await db.scheduleTrack.deleteMany({ where: { id: { in: deletedTracks.map((t) => t.id) } } });
    }

    for (const track of tracks) {
      if (track.id.startsWith('NEW')) {
        await db.scheduleTrack.create({ data: { name: track.name, schedule: { connect: { id: schedule.id } } } });
      } else {
        await db.scheduleTrack.update({ where: { id: track.id }, data: { name: track.name } });
      }
    }
  }

  async getScheduleSessions() {
    const event = await this.userEvent.needsPermission('canEditEventSchedule');
    if (event.type === 'MEETUP') throw new ForbiddenOperationError();

    const schedule = await db.schedule.findFirst({
      where: { eventId: event.id },
      include: { tracks: true, sessions: true },
    });
    if (!schedule) return null;

    const sessions = await db.scheduleSession.findMany({
      where: { scheduleId: schedule.id },
      include: { proposal: { include: { legacySpeakers: true, formats: true, categories: true } } },
    });

    return {
      name: schedule.name,
      start: schedule.start,
      end: schedule.end,
      timezone: schedule.timezone,
      displayStartMinutes: schedule.displayStartMinutes,
      displayEndMinutes: schedule.displayEndMinutes,
      tracks: [...schedule.tracks]
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        .map((t) => ({ id: t.id, name: t.name })),
      sessions: sessions.map(({ id, trackId, start, end, name, language, color, emojis, proposal }) => ({
        id: id,
        trackId: trackId,
        start: start,
        end: end,
        name: name,
        language: language,
        emojis: emojis,
        color: color,
        proposal: proposal
          ? {
              id: proposal.id,
              title: proposal.title,
              deliberationStatus: proposal.deliberationStatus,
              confirmationStatus: proposal.confirmationStatus,
              formats: proposal.formats.map((f) => ({ id: f.id, name: f.name })),
              categories: proposal.categories.map((c) => ({ id: c.id, name: c.name })),
              speakers: proposal.legacySpeakers.map((s) => ({
                id: s.id,
                name: s.name,
                picture: s.picture,
                company: s.company,
              })),
            }
          : null,
      })),
    };
  }

  async forJsonExport() {
    const event = await this.userEvent.needsPermission('canEditEventSchedule');

    return EventSchedule.toJson(event.id, event.type);
  }

  static async forJsonApi(eventSlug: string, apiKey: string) {
    const event = await db.event.findFirst({ where: { slug: eventSlug } });

    if (!event) throw new EventNotFoundError();
    if (event.apiKey !== apiKey) throw new ApiKeyInvalidError();

    return EventSchedule.toJson(event.id, event.type);
  }

  static async toJson(eventId: string, eventType: EventType) {
    if (eventType === 'MEETUP') throw new ForbiddenOperationError();

    const schedule = await db.schedule.findFirst({ where: { eventId }, include: { sessions: true } });
    if (!schedule) return null;

    const sessions = await db.scheduleSession.findMany({
      where: { scheduleId: schedule.id },
      include: { proposal: { include: { legacySpeakers: true, formats: true, categories: true } }, track: true },
    });

    const days = getDatesRange(schedule.start, schedule.end);

    return {
      name: schedule.name,
      days: days.map((day) => toZonedTime(day, schedule.timezone).toISOString()),
      timeZone: schedule.timezone,
      sessions: sessions.map(({ proposal, track, ...session }) => ({
        id: session.id,
        start: toZonedTime(session.start, schedule.timezone).toISOString(),
        end: toZonedTime(session.end, schedule.timezone).toISOString(),
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
              speakers: proposal.legacySpeakers.map((speaker) => ({
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
