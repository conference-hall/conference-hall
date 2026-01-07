import { redirect } from 'react-router';
import { AuthorizedEventContext } from '~/shared/authorization/authorization.middleware.ts';
import type { Route } from './+types/json.ts';
import { EventScheduleExport } from './services/schedule-export.server.ts';

export const loader = async ({ params, context }: Route.LoaderArgs) => {
  const authorizedEvent = context.get(AuthorizedEventContext);

  const schedule = await EventScheduleExport.forUser(authorizedEvent).toJson();
  if (!schedule) return redirect(`/team/${params.team}/${params.event}/schedule`);

  return Response.json(schedule, {
    headers: { 'Content-Disposition': `attachment; filename="${params.event}-schedule.json"` },
  });
};
