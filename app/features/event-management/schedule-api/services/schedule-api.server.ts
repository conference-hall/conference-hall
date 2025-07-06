import { db } from 'prisma/db.server.ts';
import { ApiKeyInvalidError, EventNotFoundError } from '~/shared/errors.server.ts';
import { UserEventAuthorization } from '~/shared/user/user-event-authorization.server.ts';
import { EventScheduleExport } from '../../schedule/services/schedule-export.server.ts';

export class EventScheduleApi extends UserEventAuthorization {
  static for(userId: string, team: string, event: string) {
    return new EventScheduleApi(userId, team, event);
  }

  static async forJsonApi(eventSlug: string, apiKey: string) {
    const event = await db.event.findFirst({ where: { slug: eventSlug } });

    if (!event) throw new EventNotFoundError();
    if (event.apiKey !== apiKey) throw new ApiKeyInvalidError();

    return EventScheduleExport.toJson(event.id, event.type);
  }
}
