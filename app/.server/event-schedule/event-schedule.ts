import type { Prisma } from '@prisma/client';
import { addDays, isAfter, isBefore } from 'date-fns';
import { db } from 'prisma/db.server.ts';

import { ForbiddenError, ForbiddenOperationError, NotFoundError } from '~/libs/errors.server.ts';

import { UserEvent } from '../event-settings/user-event.ts';
import type {
  ScheduleCreateData,
  ScheduleSessionCreateData,
  ScheduleSessionUpdateData,
  ScheduleTrackSaveData,
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
      start: schedule.start.toISOString(),
      end: schedule.end.toISOString(),
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

    return db.scheduleSession.update({
      data: {
        trackId: data.trackId,
        start: data.start,
        end: data.end,
        color: data.color,
        name: !data.proposalId ? data.name : null,
        proposalId: data.proposalId ? data.proposalId : null,
      },
      where: { id: data.id, scheduleId: schedule.id },
    });
  }

  async deleteSession(sessionId: string) {
    const event = await this.userEvent.needsPermission('canEditEventSchedule');
    if (event.type === 'MEETUP') throw new ForbiddenOperationError();

    const schedule = await db.schedule.findFirst({ where: { eventId: event.id } });
    if (!schedule) throw new NotFoundError('Schedule not found');

    await db.scheduleSession.delete({ where: { id: sessionId, scheduleId: schedule.id } });
  }

  async saveTrack(data: ScheduleTrackSaveData) {
    const event = await this.userEvent.needsPermission('canEditEventSchedule');
    if (event.type === 'MEETUP') throw new ForbiddenOperationError();

    const schedule = await db.schedule.findFirst({ where: { eventId: event.id } });
    if (!schedule) throw new NotFoundError('Schedule not found');

    if (data.id) {
      return db.scheduleTrack.update({ where: { id: data.id }, data: { name: data.name } });
    }
    return db.scheduleTrack.create({ data: { name: data.name, schedule: { connect: { id: schedule.id } } } });
  }

  async deleteTrack(trackId: string) {
    const event = await this.userEvent.needsPermission('canEditEventSchedule');
    if (event.type === 'MEETUP') throw new ForbiddenOperationError();

    const schedule = await db.schedule.findFirst({ where: { eventId: event.id }, include: { tracks: true } });
    if (!schedule) throw new NotFoundError('Schedule not found');
    if (schedule.tracks.length <= 1) throw new ForbiddenError('You must have at least one room defined');

    return db.scheduleTrack.delete({ where: { id: trackId } });
  }

  async getSchedulesByDay(dayIndex: number) {
    const event = await this.userEvent.needsPermission('canEditEventSchedule');
    if (event.type === 'MEETUP') throw new ForbiddenOperationError();

    const schedule = await db.schedule.findFirst({
      where: { eventId: event.id },
      include: { tracks: true, sessions: true },
    });
    if (!schedule) return null;

    const currentDay = addDays(schedule.start, dayIndex);

    if (isBefore(currentDay, schedule.start) || isAfter(currentDay, schedule.end)) {
      throw new NotFoundError('Day not in schedule');
    }

    const sessions = await db.scheduleSession.findMany({
      where: { scheduleId: schedule.id },
      include: { proposal: { include: { speakers: true, formats: true, categories: true } } },
    });

    const hasPreviousDay = !isBefore(addDays(currentDay, dayIndex - 1), schedule.start);
    const hasNextDay = !isAfter(addDays(currentDay, dayIndex + 1), schedule.end);

    return {
      name: schedule.name,
      timezone: schedule.timezone,
      currentDay: currentDay.toISOString(),
      displayStartMinutes: schedule.displayStartMinutes,
      displayEndMinutes: schedule.displayEndMinutes,
      previousDayIndex: hasPreviousDay ? dayIndex - 1 : null,
      nextDayIndex: hasNextDay ? dayIndex + 1 : null,
      tracks: [...schedule.tracks]
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        .map((t) => ({ id: t.id, name: t.name })),
      sessions: sessions.map(({ id, trackId, start, end, name, color, proposal }) => ({
        id: id,
        trackId: trackId,
        start: start.toISOString(),
        end: end.toISOString(),
        color: color,
        name: name,
        proposal: proposal
          ? {
              id: proposal.id,
              title: proposal.title,
              languages: proposal.languages as string[],
              deliberationStatus: proposal.deliberationStatus,
              confirmationStatus: proposal.confirmationStatus,
              formats: proposal.formats.map((f) => ({ id: f.id, name: f.name })),
              categories: proposal.categories.map((c) => ({ id: c.id, name: c.name })),
              speakers: proposal.speakers.map((s) => ({
                id: s.id,
                name: s.name,
                picture: s.picture,
                bio: s.bio,
                company: s.company,
              })),
            }
          : null,
      })),
    };
  }
}
