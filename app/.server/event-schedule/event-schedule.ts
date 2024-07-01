import { eachDayOfInterval } from 'date-fns';
import { db } from 'prisma/db.server.ts';

import { ForbiddenError, ForbiddenOperationError, NotFoundError } from '~/libs/errors.server.ts';

import { UserEvent } from '../event-settings/user-event.ts';
import type {
  ScheduleCreateData,
  ScheduleEditData,
  ScheduleSessionSaveData,
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

  // TODO: moves all "this.userEvent.allowedFor" in controllers ?
  async get() {
    const event = await this.userEvent.allowedFor(['OWNER', 'MEMBER']);
    if (event.type === 'MEETUP') throw new ForbiddenOperationError();

    const schedule = await db.schedule.findFirst({
      where: { eventId: event.id },
      include: { days: true, tracks: true },
    });
    if (!schedule) return null;

    return {
      id: schedule.id,
      name: schedule.name,
      startDate: schedule.startDate,
      endDate: schedule.endDate,
      days: [...schedule.days]
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        .map((d) => ({ id: d.id, day: d.day, startTime: d.startTime, endTime: d.endTime })),
      tracks: [...schedule.tracks]
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        .map((t) => ({ id: t.id, name: t.name })),
    };
  }

  // TODO: Add tests
  async getSessionsByDay(scheduleId: string, dayId: string) {
    const sessions = await db.scheduleSession.findMany({ where: { day: { id: dayId, scheduleId } } });
    return sessions.map((session) => ({
      id: session.id,
      trackId: session.trackId,
      timeslot: {
        start: session.startTime,
        end: session.endTime,
      },
    }));
  }

  // TODO: Add tests
  async addSession(dayId: string, data: ScheduleSessionSaveData) {
    await db.scheduleSession.create({ data: { dayId, ...data } });
  }

  // TODO: Add tests
  async updateSession(sessionId: string, data: ScheduleSessionSaveData) {
    console.log({ sessionId, data });
    await db.scheduleSession.update({ data, where: { id: sessionId } });
  }

  // TODO: Add tests
  async create(data: ScheduleCreateData) {
    const event = await this.userEvent.allowedFor(['OWNER', 'MEMBER']);
    if (event.type === 'MEETUP') throw new ForbiddenOperationError();

    const days = eachDayOfInterval({ start: data.startDate, end: data.endDate });

    await db.schedule.create({
      data: {
        ...data,
        days: { createMany: { data: days.map((day) => ({ day })) } },
        tracks: { create: { name: 'Main stage' } },
        event: { connect: { slug: this.eventSlug } },
      },
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
