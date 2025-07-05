import { redirect } from 'react-router';
import { EventSchedule } from '~/.server/event-schedule/event-schedule.ts';
import { requireUserSession } from '~/shared/auth/session.ts';
import type { Route } from './+types/export.json.ts';

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);
  const eventSchedule = EventSchedule.for(userId, params.team, params.event);

  const schedule = await eventSchedule.forJsonExport();
  if (!schedule) return redirect(`/team/${params.team}/${params.event}/schedule`);

  return Response.json(schedule, {
    headers: {
      'Content-Disposition': `attachment; filename="${params.event}-schedule.json"`,
    },
  });
};
