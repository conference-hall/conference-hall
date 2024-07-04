import { eachDayOfInterval, endOfDay, format, isAfter, isBefore, isEqual, parse, startOfDay } from 'date-fns';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';
import { db } from 'prisma/db.server.ts';

import { ForbiddenError, ForbiddenOperationError, NotFoundError } from '~/libs/errors.server.ts';

import { UserEvent } from '../event-settings/user-event.ts';
import type {
  ScheduleCreateData,
  ScheduleEditData,
  ScheduleSessionCreateData,
  ScheduleSessionUpdateData,
  ScheduleTrackSaveData,
} from './event-schedule.types.ts';

const TZ = 'Europe/Paris';

export class EventSchedule {
  constructor(
    private eventSlug: string,
    private userEvent: UserEvent,
  ) {}

  static for(userId: string, teamSlug: string, eventSlug: string) {
    const userEvent = UserEvent.for(userId, teamSlug, eventSlug);
    return new EventSchedule(eventSlug, userEvent);
  }

  // TODO: moves all "this.userEvent.allowedFor" in controllers ?
  async get() {
    const event = await this.userEvent.allowedFor(['OWNER', 'MEMBER']);
    if (event.type === 'MEETUP') throw new ForbiddenOperationError();

    const schedule = await db.schedule.findFirst({ where: { eventId: event.id }, include: { tracks: true } });
    if (!schedule) return null;

    return {
      id: schedule.id,
      name: schedule.name,
      start: schedule.start.toISOString(),
      end: schedule.end.toISOString(),
      timezone: TZ,
      tracks: [...schedule.tracks]
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        .map((t) => ({ id: t.id, name: t.name })),
    };
  }

  // TODO: Add tests
  async create(data: ScheduleCreateData) {
    const event = await this.userEvent.allowedFor(['OWNER', 'MEMBER']);
    if (event.type === 'MEETUP') throw new ForbiddenOperationError();

    await db.schedule.create({
      data: {
        name: data.name,
        start: data.start,
        end: data.end,
        tracks: { create: { name: 'Main stage' } },
        event: { connect: { slug: this.eventSlug } },
      },
    });
  }

  // TODO: Add tests
  async getSchedulesByDay(dayId: string) {
    const event = await this.userEvent.allowedFor(['OWNER', 'MEMBER']);
    if (event.type === 'MEETUP') throw new ForbiddenOperationError();

    const schedule = await db.schedule.findFirst({
      where: { eventId: event.id },
      include: { tracks: true, sessions: true },
    });
    if (!schedule) return null;

    const currentDayUtc = fromZonedTime(startOfDay(parse(dayId, 'yyyy-MM-dd', toZonedTime(new Date(), TZ))), TZ); // TODO: should be timezoned

    if (isBefore(currentDayUtc, schedule.start) || isAfter(currentDayUtc, schedule.end)) {
      throw new NotFoundError('Day not in schedule');
    }

    const daysTz = eachDayOfInterval({
      start: toZonedTime(schedule.start, TZ),
      end: toZonedTime(schedule.end, TZ),
    }).map((d) => startOfDay(d)); // TODO: should be timezoned

    const currentDayTz = toZonedTime(currentDayUtc, TZ);
    const currentDayIndex = daysTz.findIndex((d) => isEqual(d, currentDayTz));

    const previousDayTz = daysTz[currentDayIndex - 1];
    const nextDayTz = daysTz[currentDayIndex + 1];

    const sessions = await db.scheduleSession.findMany({
      where: {
        scheduleId: schedule.id,
        start: { gte: fromZonedTime(startOfDay(currentDayTz), TZ) },
        end: { lte: fromZonedTime(endOfDay(currentDayTz), TZ) },
      },
    });

    return {
      name: schedule.name,
      currentDay: format(currentDayTz, 'yyyy-MM-dd'),
      previousDay: previousDayTz ? format(previousDayTz, 'yyyy-MM-dd') : null,
      nextDay: nextDayTz ? format(nextDayTz, 'yyyy-MM-dd') : null,
      tracks: [...schedule.tracks]
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        .map((t) => ({ id: t.id, name: t.name })),
      sessions: sessions.map((session) => ({
        id: session.id,
        trackId: session.trackId,
        start: session.start.toISOString(),
        end: session.end.toISOString(),
      })),
    };
  }

  // TODO: Add tests
  async addSession(data: ScheduleSessionCreateData) {
    const event = await this.userEvent.allowedFor(['OWNER', 'MEMBER']);
    if (event.type === 'MEETUP') throw new ForbiddenOperationError();

    const schedule = await db.schedule.findFirst({ where: { eventId: event.id }, include: { sessions: true } });
    if (!schedule) return null;

    await db.scheduleSession.create({
      data: {
        trackId: data.trackId,
        start: data.start,
        end: data.end,
        scheduleId: schedule.id,
      },
    });
  }

  // TODO: Add tests
  async updateSession(data: ScheduleSessionUpdateData) {
    await db.scheduleSession.update({
      data: {
        trackId: data.trackId,
        start: data.start,
        end: data.end,
      },
      where: { id: data.id },
    });
  }

  // TODO: Add tests
  async edit(data: ScheduleEditData) {
    const event = await this.userEvent.allowedFor(['OWNER', 'MEMBER']);
    if (event.type === 'MEETUP') throw new ForbiddenOperationError();

    const schedule = await db.schedule.findFirst({ where: { eventId: event.id } });
    if (!schedule) throw new NotFoundError('Schedule not found');

    await db.schedule.update({ data, where: { id: schedule.id } });
  }

  // TODO: Add tests
  async delete() {
    const event = await this.userEvent.allowedFor(['OWNER', 'MEMBER']);
    if (event.type === 'MEETUP') throw new ForbiddenOperationError();

    const schedule = await db.schedule.findFirst({ where: { eventId: event.id } });
    if (!schedule) throw new NotFoundError('Schedule not found');

    await db.schedule.delete({ where: { id: schedule.id } });
  }

  async saveSettings(data: ScheduleEditData) {
    const event = await this.userEvent.allowedFor(['OWNER', 'MEMBER']);
    if (event.type === 'MEETUP') throw new ForbiddenOperationError();

    const schedule = await db.schedule.findFirst({ where: { eventId: event.id } });
    if (!schedule) throw new NotFoundError('Schedule not found');

    await db.schedule.update({ data, where: { id: schedule.id } });
  }

  async saveTrack(data: ScheduleTrackSaveData) {
    const event = await this.userEvent.allowedFor(['OWNER', 'MEMBER']);
    if (event.type === 'MEETUP') throw new ForbiddenOperationError();

    const schedule = await db.schedule.findFirst({ where: { eventId: event.id } });
    if (!schedule) throw new NotFoundError('Schedule not found');

    if (data.id) {
      return db.scheduleTrack.update({ where: { id: data.id }, data: { name: data.name } });
    }
    return db.scheduleTrack.create({ data: { name: data.name, schedule: { connect: { id: schedule.id } } } });
  }

  async deleteTrack(trackId: string) {
    const event = await this.userEvent.allowedFor(['OWNER', 'MEMBER']);
    if (event.type === 'MEETUP') throw new ForbiddenOperationError();

    const schedule = await db.schedule.findFirst({ where: { eventId: event.id }, include: { tracks: true } });
    if (!schedule) throw new NotFoundError('Schedule not found');
    if (schedule.tracks.length <= 1) throw new ForbiddenError('You must have at least one room defined');

    return db.scheduleTrack.delete({ where: { id: trackId } });
  }
}
