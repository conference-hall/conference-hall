import { getWebApiEvent, webApiMiddleware } from '~/shared/web-api/web-api.middleware.ts';
import type { Route } from './+types/schedule-api.ts';
import { EventScheduleApi } from './services/schedule-api.server.ts';

export const middleware = [webApiMiddleware];

export const loader = async ({ context }: Route.LoaderArgs) => {
  const event = getWebApiEvent(context);
  const schedule = await EventScheduleApi.forJsonApi(event);
  return Response.json(schedule);
};
