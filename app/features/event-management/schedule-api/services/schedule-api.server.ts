import type { Event } from 'prisma/generated/client.ts';
import { NotFoundError } from '~/shared/errors.server.ts';
import { EventScheduleExport } from '../../schedule/services/schedule-export.server.ts';

export class EventScheduleApi {
  static async forJsonApi(event: Event) {
    const scheduleExport = await EventScheduleExport.toJson(event);

    if (!scheduleExport) throw new NotFoundError(`No schedule found for "${event.slug}" event`);

    return scheduleExport;
  }
}
