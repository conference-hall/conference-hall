import { redirect } from 'react-router';
import { requireUserSession } from '~/shared/auth/session.ts';
import type { Route } from './+types/export.json.ts';
import { EventScheduleExport } from './services/schedule-export.server.ts';

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);
  const eventSchedule = EventScheduleExport.for(userId, params.team, params.event);

  const schedule = await eventSchedule.forJsonExport();
  if (!schedule) return redirect(`/team/${params.team}/${params.event}/schedule`);

  return Response.json(schedule, {
    headers: {
      'Content-Disposition': `attachment; filename="${params.event}-schedule.json"`,
    },
  });
};
