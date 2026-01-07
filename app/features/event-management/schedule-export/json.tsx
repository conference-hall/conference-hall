import { redirect } from 'react-router';
import { AuthorizedEventContext } from '~/shared/authorization/authorization.middleware.ts';
import type { Route } from './+types/json.ts';
import { EventScheduleExport } from './services/schedule-export.server.ts';

export const loader = async ({ params, context }: Route.LoaderArgs) => {
  const authorizedEvent = context.get(AuthorizedEventContext);

  const stream = await EventScheduleExport.forUser(authorizedEvent).toJsonStream();
  if (!stream) return redirect(`/team/${params.team}/${params.event}/schedule`);

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${params.event}-schedule.json"`,
    },
  });
};
