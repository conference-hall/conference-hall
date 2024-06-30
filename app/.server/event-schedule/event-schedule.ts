import { db } from 'prisma/db.server.ts';

import { ForbiddenOperationError, NotFoundError } from '~/libs/errors.server.ts';

import { UserEvent } from '../event-settings/user-event.ts';
import type { ScheduleSettingsData } from './event-schedule.types.ts';

export class EventSchedule {
  constructor(private userEvent: UserEvent) {}

  static for(userId: string, teamSlug: string, eventSlug: string) {
    const userEvent = UserEvent.for(userId, teamSlug, eventSlug);
    return new EventSchedule(userEvent);
  }

  async settings() {
    const event = await this.userEvent.allowedFor(['OWNER', 'MEMBER']);
    if (event.type === 'MEETUP') throw new ForbiddenOperationError();

    const schedule = await db.schedule.findFirst({ where: { eventId: event.id } });
    if (!schedule) return null;

    // TODO: check if conflicts when changing timeslots and intervals

    return {
      name: schedule.name,
      startTimeslot: schedule.startTimeslot,
      endTimeslot: schedule.endTimeslot,
      intervalMinutes: schedule.intervalMinutes,
    };
  }

  async saveSettings(data: ScheduleSettingsData) {
    const event = await this.userEvent.allowedFor(['OWNER', 'MEMBER']);
    if (event.type === 'MEETUP') throw new ForbiddenOperationError();

    const schedule = await db.schedule.findFirst({ where: { eventId: event.id } });
    if (!schedule) throw new NotFoundError('Schedule not found');

    await db.schedule.update({ data, where: { id: schedule.id } });
  }

  async saveTrack() {
    const event = await this.userEvent.allowedFor(['OWNER', 'MEMBER']);
    if (event.type === 'MEETUP') throw new ForbiddenOperationError();
  }

  async deleteTrack() {
    const event = await this.userEvent.allowedFor(['OWNER', 'MEMBER']);
    if (event.type === 'MEETUP') throw new ForbiddenOperationError();
  }
}
