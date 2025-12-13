import type { Event } from 'prisma/generated/client.ts';
import { EventAuthorization } from '~/shared/user/event-authorization.server.ts';
import { EventScheduleExport } from '../../schedule/services/schedule-export.server.ts';

export class EventScheduleApi extends EventAuthorization {
  static async forJsonApi(event: Event) {
    return EventScheduleExport.toJson(event.id, event.type);
  }
}
